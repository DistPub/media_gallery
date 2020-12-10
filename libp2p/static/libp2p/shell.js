import { log, AsyncFunction } from "./utils.js"

class Shell extends window.events.EventEmitter{
  constructor(userNode) {
    super()
    this.userNode = userNode
    this.addEventListener()
  }

  addEventListener() {
    this.userNode.on('handle:request', data => this.emit('action:request', data))
    this.userNode.on('handle:response', data => this.emit('action:response', data))
  }

  async exec({ topic, receivers, action, args}) {
    if (!receivers.length) {
      await this.applyAction(topic, action, args)
    } else {
      await this.rpc(topic, receivers, action, args)
    }
  }

  async getStream(id, action) {
    let connection = await this.userNode.getConnectionById(id)

    try {
      return await this.userNode.getStreamByConnectionProtocol(connection, action)
    } catch (error) {
      log(`connection maybe closed, get stream error: ${error}`)
      await this.userNode.getConnectionById(id)
      return await this.getStream(id, action)
    }
  }

  async rpc(topic, receivers, action, args) {
    const id = this.userNode.id
    const username = this.userNode.username

    for (const receiver of receivers) {
      const stream = await this.getStream(receiver, action)

      this.emit('action:request', {
        topic,
        receiver: receiver,
        request: { action, args },
        sender: id,
        username
      })

      const [remoteUser, status, results] = await this.userNode.pipe([username, topic].concat(args), stream)

      this.emit('action:response', {
        topic,
        sender: receiver,
        username: remoteUser,
        receiver: id,
        response: { status, results }
      })
    }
  }

  async applyAction(topic, action, args) {
    const id = this.userNode.id
    const username = this.userNode.username

    this.emit('action:request', {
      topic,
      receiver: id,
      request: { action, args },
      sender: id,
      username: username
    })

    let status = 0
    let results

    try {
      const func = this['action' + action.slice(1)]
      if (func instanceof AsyncFunction) {
        results = func({}, ...args)
      } else {
        results = await func({}, ...args)
      }

      if (results === undefined) {
        results = null
      }
    } catch(error) {
      status = 1
      results = error.toString()
    }

    this.emit('action:response', {
      topic,
      sender: id,
      username: username,
      receiver: id,
      response: { status, results }
    })
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
      results.push([Shell.translateActionNameToProtocol(action), this[action]])
    }
    return results
  }

  static translateActionNameToProtocol(action) {
    return '/' + action.slice('action'.length)
  }

  actionWhoami(_, arg) {
    if (arg === '--help') {
      return 'show the username related to the peer id'
    } else if (args === '--version'){
      return '1.0.0'
    }

    if (!arguments.length) {
      return this.userNode.username
    }
    throw `unsupported args: ${arg}`
  }
}

export default Shell