export class ActionHelper {
  constructor(shell, autoPipe=true, pipeOption={}, actions=[]) {
    this.shell = shell
    this.autoPipe = autoPipe
    this.pipeOption = pipeOption
    this.actions = actions
  }

  clone() {
    return new Proxy(new ActionHelper(this.shell, this.autoPipe, this.pipeOption, this.actions), proxyHandler)
  }

  toJSON() {
    if (!this.actions.length) {
      throw `You need set one action at least!`
    }

    const [action, ...more] = this.actions

    if (!more.length) {
      return action
    }

    if (this.autoPipe) {
      return { ...this.pipeOption, action: '/PipeExec', args: this.actions }
    }

    throw 'You need use `pipe` action to aggregate multiple actions!'
  }

  /**
   * Shortcut for pipe then reduce
   *  Note: there is no action named `collect`
   * @param receivers - pipe receivers
   * @param topic - pipe topic
   * @returns {*} this helper
   */
  collect(receivers=[], topic='topic') {
    this.actions = [
      {action: '/PipeExec', args: this.actions, receivers, topic},
      {action: '/ReduceResults'}
    ]
    return this.clone()
  }

  get Collect() {
    return this.collect()
  }

  /**
   * Alias for action /ReduceResults
   */
  reduce(args=[], receivers=[], topic='topic') {
    this.actions.push({action: '/ReduceResults', args, receivers, topic})
    return this.clone()
  }

  get Reduce() {
    return this.reduce()
  }

  /**
   * Alias for action /MapArgs
   */
  map(args=[], receivers=[], topic='topic') {
    this.actions.push({action: '/MapArgs', args, receivers, topic})
    return this.clone()
  }

  get Map() {
    return this.map()
  }

  /**
   * Alias for action /PipeExec
   */
  pipe(receivers=[], topic='topic') {
    this.actions = [{action: '/PipeExec', args: this.actions, receivers, topic}]
    return this.clone()
  }

  get Pipe() {
    return this.pipe()
  }
}

export const proxyHandler = {
  get(target, prop, receiver) {
    if (prop in target) {
      return Reflect.get(...arguments)
    }

    let actionName = `action${prop}`
    if (actionName in target.shell) {
      target.actions.push({action: `/${prop}`})
      return target.clone()
    }

    prop = prop[0].toUpperCase() + prop.slice(1)
    actionName = `action${prop}`
    if (actionName in target.shell) {
      return (args=[], receivers=[], topic='topic') => {
        target.actions.push({action: `/${prop}`, args, receivers, topic})
        return target.clone()
      }
    }

    throw `Action method(${actionName}) not found in shell`
  }
}
