function a() {
  console.log('a')
  console.log(this.userNode.username)
}

function b(metadata) {
  console.log('b')
  console.log(metadata)
}

function privateLogic() {
  console.log('private')
}

function c() {
  console.log('c')
  privateLogic()
}

export default [a, b, c]
