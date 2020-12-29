class ActionResponse {
  constructor(action, autoTripPipe=true) {
    this.action = action
    this.autoTripPipe = autoTripPipe
    this._payloads = []
  }

  get isPipeAction() {
    return this.action.action === '/PipeExec'
  }

  get payloads() {
    if (this.isPipeAction && this.autoTripPipe) {
      return this._payloads[0].response.results
    }
    return this._payloads
  }

  add(payload) {
    this._payloads.push(payload)
  }

  get ok() {
    return this.payloads.map(item => item.response.status).reduce((a, b) => a + b, 0) === 0
  }

  txt() {
    return this.payloads.map(item => item.response.results).join('\n')
  }

  json() {
    let [payload, ...more] = this.payloads
    if (!more.length) {
      return payload.response.results
    }
    return this.payloads.map(item => item.response.results)
  }
}

export default ActionResponse