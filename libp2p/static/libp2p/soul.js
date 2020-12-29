import dayjs from 'https://cdn.jsdelivr.net/npm/dayjs@1.9.6/esm/index.js/+esm'
import { log } from './utils.js'

class Soul extends window.events.EventEmitter {
  constructor(db, username) {
    super()
    this.username = username
    this.db = db
    this.experiences = []
    this.pre = null
  }

  async init(optionFilter=item=>item) {
    const repo = `${this.username}/ipfs`
    this.node = await window.Ipfs.create(optionFilter({ repo }))
    this.repo = new window.datastoreLevel(repo, {prefix: '', version: 2})
    try {
      this.experiences = (await this.db.get('experiences')).map(item => new window.cids(item))
      this.pre = new window.cids(await this.db.get('pre'))
    } catch(error) {
      log(`get experiences from db error: ${error}`)
    }
  }

  addEventListener(shell) {
    shell.on('action:request', data => this.handleExperience(data))
    shell.on('action:response', data => this.handleExperience(data))
  }

  async handleExperience(data) {
    const cid = await this.node.dag.put(data)
    this.experiences.push(cid)
    await this.db.put('experiences', this.experiences.map(item => item.toString()));
  }

  async summarize() {
    if (!this.experiences.length) {
      return
    }
    const cid = await this.node.dag.put({ experiences: this.experiences, pre: this.pre })
    this.experiences = []
    await this.db.put('experiences', []);
    this.pre = cid
    await this.db.put('pre', this.pre.toString());
  }

  async remember() {
    const path = dayjs().format('/YYYY/MM/DD')
    await this.node.files.mkdir(path, { parents: true })
    const file = `${path}/history.txt`
    await this.node.files.touch(file)


    await this.summarize()

    if (!this.pre) {
      return
    }

    const { size: offset } = await this.node.files.stat(file)
    await this.node.files.write(file, `${this.pre}\n`, { offset })
  }

  async backwards(experience=null, reverse=true) {
    let experiences;
    let pre;

    if (!experience) {
      experiences = this.experiences
      pre = this.pre
    } else {
      const { value } = await this.node.dag.get(experience)
      experiences = value.experiences
      pre = value.pre
    }

    if (reverse) {
      experiences = experiences.reverse()
    }

    experiences.map(async item => this.emit('backwards', (await this.node.dag.get(item)).value))
    return pre
  }

  async empathy(experience, deep=0) {
    let cursor = experience
    let experiences = []
    let recursive = deep === 1

    do {
      const { value } = await this.node.dag.get(cursor)
      experiences = value.experiences.concat(experiences)
      cursor = value.pre

      if (!cursor) {
        break
      }

      deep ++
    } while (deep <= 0 || recursive)
    experiences.map(async item => this.emit('empathy', (await this.node.dag.get(item)).value))
    this.experiences = this.experiences.concat(experiences)
    await this.db.put('experiences', this.experiences.map(item => item.toString()));
  }

  async resetMemory(root) {
    await this.repo.put('/local/filesroot', new window.cids(root).bytes)
  }

  async getMemory() {
    return new window.cids(await this.repo.get('/local/filesroot')).toString()
  }

  /**
   * Push file to ipfs
   * @param content - data
   * @param path - tmp path or mfs path
   * @returns {Promise.<string>} ipfs path or mfs path
   */
  async push(content, path) {
    const tmp = path.startsWith('/tmp/') || path.startsWith('/ipfs/')
    const filename = path.substring(path.lastIndexOf("/") + 1, path.length);

    const fileObject = { path: filename, content }
    let options

    if (tmp) {
      options = {wrapWithDirectory: true}
    }

    let { cid } = await this.node.add(fileObject, options)

    if (tmp) {
      return `/ipfs/${cid}/${filename}`
    } else {
      await this.node.files.cp(`/ipfs/${cid}`, path, { parents: true })
      return path
    }
  }

  /**
   * Pull file from ipfs
   * @param path - cid or mfs path
   * @returns {Promise.<uint8Array>}
   */
  async pull(path) {
    let cid

    if (!path.startsWith('/ipfs/')) {
      const stats = await this.node.files.stat(path)
      cid = stats.cid
    }

    const data = []
    let size = 0
    for await (const chunk of this.node.cat(cid || path)) {
      data.push(chunk)
      size = size + chunk.size
    }

    return window.uint8ArrayConcat(data, size)
  }
}

export default Soul