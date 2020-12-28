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
        results = await func.apply(this, [{topic}, ...args])
      } else if (func instanceof Function) {
        results = func.apply(this, [{topic}, ...args])
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

  async installModule(...pathes) {
    for (const path of pathes) {
      try {
        const {default: actions} = await import(path)
        for (const action of actions) {
          if (!(typeof action === 'function')) {
            continue
          }
          this.installAction(`/${action.name}`, action.bind(this))
          Shell.prototype[`action${action.name}`] = action.bind(this)
        }

        log(`install module(${path}) success`)
      } catch (error) {
        log(`install module(${path}) error: ${error}`)
      }
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

  /**
   * Show the username
   *  Note: this example use `object` type as action argument payload, so that client can pass keyword args
   *
   * @param meta -
   *  If this is a remote action call, meta contains { connection, stream, id, username, topic }
   *  If this is a local action call, meta contains { topic }
   * @param help - Show help message
   * @param version - Show version message
   * @return {string} The username
   */
  actionWhoami(meta, {help, version}) {
    if (help) {
      return 'show the username related to the peer id'
    } else if (version){
      return '1.0.0'
    } else {
      return this.userNode.username
    }
  }

  /**
   * Echo message
   *  Note: this example use `array` type as action argument payload, so that client can only pass position args
   *
   * @param _ - Meta data, this action don't care, so it give a `_` variable name
   * @param args - Need echo messages
   * @returns {string} - Combined message
   */
  actionEcho(_, ...args) {
    return args.join(' ')
  }

  /**
   * Exec action in pipe
   *
   * @param _ - Meta data
   * @param actions - Action array
   * @returns {Promise.<[ActionResponse]>} Action responses
   */
  async actionPipeExec(_, ...actions) {
    const execs = []
    for (const [idx, action] of actions.entries()) {
      if (idx === 0){
        execs.push([{ response: { results: { ignore: true } } }])
      }
      execs.push(this.createPipeExecGenerator(action))
    }
    execs.push(collect)
    return await window.itPipe(...execs)
  }
}

export default Shell