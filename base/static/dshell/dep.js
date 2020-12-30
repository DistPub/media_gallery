const browserifyClass = require('browserify')
let browserify = browserifyClass()
const deps = [
  'libp2p-noise',
  'libp2p-mplex',
  'it-pipe',
  'datastore-level',
  'libp2p',
  'libp2p-webrtc-star',
  'libp2p-crypto/src/keys',
  'events',
  'cids',
  'lodash/cloneDeep',
  'uint8arrays/concat',
  'peer-id',
  'xlsx',
  'ipfs-core']
deps.forEach(item => {
  browserify = browserify.require(item)
})
browserify.bundle().pipe(process.stdout)