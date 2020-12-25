import { log, AsyncFunction } from "./utils.js"
import { collect } from 'https://cdn.jsdelivr.net/npm/streaming-iterables@5.0.3/dist/index.mjs'

class Shell extends window.events.EventEmitter{
  constructor(userNode, soul) {
    super()
    this.soul = soul
    this.userNode = userNode
    this.addEventListener()
    this.soul.addEventListener(this)
  }

  addEventListener() {
    this.userNode.on('handle:request', data => this.emit('action:request', data))
    this.userNode.on('handle:response', data => this.emit('action:response', data))
  }

  async exec({ topic, receivers, action, args}) {
    if (!receivers.length) {
      await this.applyAction(topic, action, args)
    } else {
      for await (const _ of this.rpc(topic, receivers, action, args)) {}
    }
  }

  async *execGenerator({ topic, receivers, action, args}) {
    if (!receivers.length) {
      yield await this.applyAction(topic, action, args, true)
    } else {
      for await (const response of this.rpc(topic, receivers, action, args, true)) {
        yield response
      }
    }
  }

  async pipeExec(action, ...more) {
    if (!more.length) {
      return await this.exec(action)
    }

    const id = this.userNode.id
    const username = this.userNode.username
    const actions = [action].concat(more)
    this.emit('pipe:request', {
      actions,
      sender: id,
      username: username
    })

    const execs = []
    for (const [idx, action] of actions.entries()) {
      if (idx === 0){
        execs.push([{ response: { results: { ignore: true } } }])
      }
      execs.push(this.createPipeExecGenerator(action))
    }
    execs.push(collect)
    const responses = await window.itPipe(...execs)
    this.emit('pipe:response', {
      actions,
      responses,
      receiver: id
    })
  }

  createPipeExecGenerator(action) {
    const nextAction = {...action}
    async function* wrapper(preActionResponses) {
      for await (const item of preActionResponses) {
        if (!item.response.results.ignore) {
          nextAction.args = nextAction.args.concat([item.response.results])
        }
        for await (const item of this.execGenerator(nextAction)) {
          yield item
        }
      }
    }
    return wrapper.bind(this)
  }

  async getStream(id, action) {
    let connection = await this.userNode.getConnectionById(id)

    try {
      return await this.userNode.getStreamByConnectionProtocol(connection, action)
    } catch (error) {
      if (error.code === 'ERR_UNSUPPORTED_PROTOCOL') {
        throw error
      }
      log(`connection maybe closed, get stream error: ${error}`)
      await this.userNode.getConnectionById(id)
      return await this.getStream(id, action)
    }
  }

  async *rpc(topic, receivers, action, args, pipe) {
    const id = this.userNode.id
    const username = this.userNode.username

    for (const receiver of receivers) {
      const stream = await this.getStream(receiver, action)

      if (!pipe) {
        this.emit('action:request', {
          topic,
          receiver: receiver,
          request: {action, args},
          sender: id,
          username
        })
      }

      const [remoteUser, status, results] = await this.userNode.pipe([username, topic].concat(args), stream)
      const response = {
        topic,
        sender: receiver,
        username: remoteUser,
        receiver: id,
        response: { status, results }
      }

      if (pipe) {
        yield response
      } else {
        this.emit('action:response', response)
      }
    }
  }

  async applyAction(topic, action, args, pipe) {
    const id = this.userNode.id
    const username = this.userNode.username

    if (!pipe) {
      this.emit('action:request', {
        topic,
        receiver: id,
        request: {action, args},
        sender: id,
        username: username
      })
    }

    let status = 0
    let results

    try {
      const func = this['action' + action.slice(1)]
      if (func instanceof AsyncFunction) {
        results = func.apply(this, [{}, ...args])
      } else if (func instanceof Function) {
        results = await func.apply(this, [{}, ...args])
      } else {
        throw `${action} action not supported in the shell`
      }

      if (results === undefined) {
        results = null
      }
    } catch(error) {
      status = 1
      results = error.toString()
    }

    const response = {
      topic,
      sender: id,
      username: username,
      receiver: id,
      response: { status, results }
    }

    if (pipe) {
      return response
    } else {
      this.emit('action:response', response)
    }
  }

  install() {
    for (const [protocol, action] of this.getAllActions()) {
      this.installAction(protocol, action)
    }
  }

  installAction(protocol, action) {
    this.userNode.node.handle(protocol, this.userNode.createProtocolHandler(action))
  }

  getAllActions() {
    const actions = Object.getOwnPropertyNames(Shell.prototype).filter(name => {
      return name.startsWith('action') && typeof this[name] === 'function'
    })
    const results = []
    for (const action of actions) {
      results.push([Shell.translateActionNameToProtocol(action), this[action].bind(this)])
    }
    return results
  }

  static translateActionNameToProtocol(action) {
    return '/' + action.slice('action'.length)
  }

  actionWhoami(_, arg) {
    if (arg === '--help') {
      return 'show the username related to the peer id'
    } else if (arg === '--version'){
      return '1.0.0'
    }

    if (!arg) {
      return this.userNode.username
    }
    throw `unsupported args: ${arg}`
  }

  actionEcho(_, ...args) {
    return args.join(' ')
  }
}

export default Shell