import { encode, decode } from "./codec.js"
import { map, collect } from 'https://cdn.jsdelivr.net/npm/streaming-iterables@5.0.3/dist/index.mjs'
import { log, AsyncFunction } from './utils.js'

const transportClassName = window.libp2pWebrtcStar.prototype[Symbol.toStringTag]

class UserNode extends window.events.EventEmitter {
  constructor(db, username, signallingServer, simplePeerOptions) {
    super()
    this.db = db
    this.username = username
    this.signallingServer = signallingServer
    this.simplePeerOptions = simplePeerOptions
    this.connectionBook = new Map()
  }

  async init() {
    this.node = await this.createLibp2pNode(this.signallingServer, this.simplePeerOptions)
    this.addEventListener()
    await this.node.start();
    this.id = this.node.peerId.toB58String()
    log(`success start node with id ${this.id}`);
    this.saveId()
  }

  async pipe(messages, stream) {
    return await window.itPipe(
      messages,
      source => map(encode, source),
      stream,
      source => map(decode, source),
      collect,
    );
  }

  async stop() {
    await this.node.stop()
    this.emit('stop')
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
      connection = await this.node.dial(window.PeerId.createFromB58String(id), { spOptions: this.simplePeerOptions })
    } catch (error) {
      log(`offline ${id} throw dial error: ${error}`)
      this.emit('user:offline', id)
      throw error
    }
    this.connectionBook.set(id, connection)
    return connection
  }

  addEventListener() {
    this.node.on('peer:discovery', async (peerId) => {
      const id = peerId.toB58String()
      log(`peer:discovery hi ${id}`)
      this.emit('user:hi', id)

      try {
        await this.node.ping(peerId)
      } catch (error) {
        log(`offline ${id} throw ping error: ${error}`)
        this.emit('user:offline', id)
      }
    })
    
    this.node.connectionManager.on('peer:connect', (connection) => {
      const id = connection.remotePeer.toB58String()
      log(`peer:connect online ${id}`)
      this.emit('user:online', id)
    })
  }

  createProtocolHandler(action) {
    return async ({ connection, stream, protocol }) => {
      const id = connection.remotePeer.toB58String()
      const [username, topic, ...args] = await window.itPipe(
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
      let results

      try {
        const di = { connection, stream, id, username, topic }
        if (action instanceof AsyncFunction) {
          results = await action(di, ...args)
        } else {
          results = action(di, ...args)
        }

        if (results === undefined) {
          results = null
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

      await window.itPipe(
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
      const peerPrivateKey = await database.get('peerPrivateKey');
      peerId = window.PeerId.createFromB58String(id)
      peerId.privKey = await window.cryptoKeys.import(peerPrivateKey, this.username)
    }

    return peerId
  }

  async createLibp2pNode(signallingServer, simplePeerOptions) {
    return await libp2p.create({
      addresses: {listen: [signallingServer]},
      modules: {
        transport: [window.libp2pWebrtcStar],
        connEncryption: [window.libp2pNoise.NOISE],
        streamMuxer: [window.libp2pMplex],
      },
      config: {
        peerDiscovery: {autoDial: false},
        transport: {
          [transportClassName]: {
            listenerOptions: simplePeerOptions
          }
        }
      },
      datastore: new window.datastoreLevel('libp2p'),
      peerStore: {
        persistence: true,
        threshold: 1
      },
      peerId: await this.getPeerId(),
    })
  }

  async saveId() {
    await this.db.put('id', this.id);
    await this.db.put('peerPrivateKey', await this.node.peerId.privKey.export(this.username));
  }
}

export default UserNode
