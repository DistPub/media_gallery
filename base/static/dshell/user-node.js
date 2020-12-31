import { encode, decode } from "./codec.js"
import { map, collect } from 'https://cdn.jsdelivr.net/npm/streaming-iterables@5.0.3/dist/index.mjs'
import { log, AsyncFunction, AsyncGeneratorFunction, GeneratorFunction } from './utils.js'
import { PeerId, libp2pNoise, libp2pMplex, itPipe, datastoreLevel, libp2p, libp2pWebrtcStar, cryptoKeys, events } from './dep.mjs'

const transportClassName = libp2pWebrtcStar.prototype[Symbol.toStringTag]

class UserNode extends events.EventEmitter {
  constructor(db, username, signallingServer, simplePeerOptions, mode='worldly') {
    super()
    this.db = db
    this.username = username
    this.signallingServer = signallingServer
    this.simplePeerOptions = simplePeerOptions
    this.mode = mode
    this.connectionBook = new Map()
  }

  async init(optionFilter=item=>item) {
    this.node = await this.createLibp2pNode(this.signallingServer, this.simplePeerOptions, optionFilter)
    this.addEventListener()
    this.id = this.node.peerId.toB58String()
    log(`success create node with id ${this.id}`)
    this.saveId()
  }

  async pipe(messages, stream) {
    return await itPipe(
      messages,
      source => map(encode, source),
      stream,
      source => map(decode, source),
      collect,
    );
  }

  async vegetative() {
    if (!this.node.isStarted()) {
      return
    }
    await this.node.stop()
    this.emit('vegetative')
  }

  async awake() {
    if (this.node.isStarted()) {
      return
    }

    if (this.mode === 'unworldly') {
      return
    }

    await this.node.start()
    this.emit('awake')
  }

  async getStreamByConnectionProtocol(connection, protocol) {
    let stream
    const id = connection.remotePeer.toB58String()
    try {
      stream = await connection.newStream(protocol);
    } catch (error) {
      log(`offline ${id} throw dial error: ${error}`)
      this.emit('user:offline', id)
      this.connectionBook.delete(id)
      throw error
    }
    stream = await stream.stream;
    return stream;
  }

  async getConnectionById(id) {
    let connection = this.connectionBook.get(id)
    
    if (connection) {
      return connection
    }
    
    try {
      connection = await this.node.dial(PeerId.createFromB58String(id), { spOptions: this.simplePeerOptions })
    } catch (error) {
      log(`offline ${id} throw dial error: ${error}`)
      this.emit('user:offline', id)
      throw error
    }
    this.connectionBook.set(id, connection)
    return connection
  }

  async pingPeer(id) {
    try {
      await this.node.ping(PeerId.createFromB58String(id))
    } catch (error) {
      log(`offline ${id} throw ping error: ${error}`)
      this.emit('user:offline', id)
    }
  }

  addEventListener() {
    this.node.on('peer:discovery', async (peerId) => {
      const id = peerId.toB58String()
      log(`peer:discovery hi ${id}`)
      this.emit('user:hi', id)
      await this.pingPeer(id)
    })
    
    this.node.connectionManager.on('peer:connect', (connection) => {
      const id = connection.remotePeer.toB58String()
      log(`peer:connect online ${id}`)
      this.emit('user:online', id)
    })
  }

  createProtocolHandler(action, soul, exec) {
    return async ({ connection, stream, protocol }) => {
      const id = connection.remotePeer.toB58String()
      const [username, topic, ...args] = await itPipe(
        stream.source,
        source => map(decode, source),
        collect
      )

      this.emit('handle:request', {
        username,
        topic,
        receiver: this.id,
        request: { action: protocol, args },
        sender: id,
      })

      let status = 0
      let results = []
      let generator

      try {
        const di = { connection, stream, id, username, topic, soul, exec }

        if (action instanceof AsyncGeneratorFunction || action instanceof GeneratorFunction) {
          generator = action(di, ...args)
        } else if (action instanceof AsyncFunction) {
          generator = (async function* () { yield await action(di, ...args) })()
        } else {
          generator = (function* () { yield  action(di, ...args) })()
        }

        for await (const item of generator) {
          if (item === undefined) {
            results.push(null)
          } else {
            results.push(item)
          }
        }
      } catch(error) {
        log(`handler error: ${error}`)
        status = 1
        results = error.toString()
      }

      this.emit('handle:response', {
        topic,
        sender: this.id,
        username: this.username,
        receiver: id,
        response: { status, results }
      })

      await itPipe(
        [this.username, status, results],
        source => map(encode, source),
        stream.sink
      )
    }
  }

  async getPeerId() {
    let id;

    try {
      id = await this.db.get('id');
    } catch (error) {
      log(`get id from db error: ${error}`);
    }

    let peerId;

    if (id) {
      const peerPrivateKey = await this.db.get('peerPrivateKey')
      peerId = PeerId.createFromB58String(id)
      peerId.privKey = await cryptoKeys.import(peerPrivateKey, this.username)
    }

    return peerId
  }

  async createLibp2pNode(signallingServer, simplePeerOptions, optionFilter) {
    return await libp2p.create(optionFilter({
      addresses: {listen: [signallingServer]},
      modules: {
        transport: [libp2pWebrtcStar],
        connEncryption: [libp2pNoise.NOISE],
        streamMuxer: [libp2pMplex],
      },
      config: {
        peerDiscovery: {autoDial: false},
        transport: {
          [transportClassName]: {
            listenerOptions: simplePeerOptions
          }
        }
      },
      datastore: new datastoreLevel(`${this.username}/libp2p`, { prefix: '' }),
      peerStore: {
        persistence: true,
        threshold: 1
      },
      peerId: await this.getPeerId(),
    }))
  }

  async saveId() {
    await this.db.put('id', this.id);
    await this.db.put('peerPrivateKey', await this.node.peerId.privKey.export(this.username));
  }

  installHandler(protocol, handler) {
    this.node.handle(protocol, handler)
  }
}

export default UserNode
