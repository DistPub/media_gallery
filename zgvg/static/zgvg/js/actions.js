import { cloneDeep } from "https://cdn.jsdelivr.net/npm/dshell@1.3.1/dep.js"

const apiActiveOrderList = atob("aHR0cDovL3dvcmsudmlnbGxlLmNvbS9CYXNlVGFibGUvSW5kZXgvSW5kZXg/VGFibGVOYW1lPVBMTi9QTE5fUHJvamVjdA==")

async function* SelectActiveOrder(di, api, callbackAction) {
  if (!api) {
    api = apiActiveOrderList
  }

  const element = document.createElement('div')
  element.innerHTML = await dshell.actionTextFetch(di, api, { cors: true })
  const rows = element.querySelectorAll('#rwd tbody tr')
  const nextApi = element.querySelector('.pagination [aria-label="Next"]').getAttribute('href')

  if (callbackAction) {
    let command = this.ensureAction(callbackAction)
    let size = rows.length
    if (nextApi !== '#') {
      size++
    }
    command.args = command.args.concat([size])
    await di.exec(command)
  }

  for (const row of rows) {
    const id = row.getAttribute('id')
    const dataset = Array.from(row.querySelectorAll('td')).map(item=>item.innerText.trim())
    yield [
      id, // meta id
      dataset[0], // 序号
      dataset[2], // 执行单 aka 项目编码
      dataset[3], // 项目名称
    ]
  }
  if (nextApi !== '#') {
    yield* SelectActiveOrder.apply(this, [di, nextApi, callbackAction])

    if (callbackAction) {
      let command = this.ensureAction(callbackAction)
      command.args = command.args.concat([-1])
      await di.exec(command)
    }
  }
}

const apiOrderDetail = atob("aHR0cDovL3dvcmsudmlnbGxlLmNvbS9CYXNlVGFibGUvRWRpdC8/VGFibGVOYW1lPVBMTi9QTE5fUHJvamVjdCZFeHRlbmQ9JlNlYXJjaEZpZWxkPQ==")

async function* SelectOrderDetail(di, riseTotalCallback, riseCompleteCallback, order) {
  const [orderID, ...rest] = order
  const api = `${apiOrderDetail}&ID=${orderID}`
  const element = document.createElement('div')
  element.innerHTML = await dshell.actionTextFetch(di, api, { cors: true })

  if (riseCompleteCallback) {
    let command = this.ensureAction(riseCompleteCallback)
    await di.exec(command)
  }

  const rows = element.querySelectorAll('#PLN_ProjectItem tbody tr.table-item')

  if (riseTotalCallback) {
    let command = this.ensureAction(riseTotalCallback)
    command.args = command.args.concat([rows.length])
    await di.exec(command)
  }

  for (const row of rows) {
    const id = row.getAttribute('id')
    const planDate = row.querySelector('.PlanDate input').value
    const dataset = Array.from(row.querySelectorAll('td')).map(item=>item.innerText.trim())
    yield [
      id, // meta id
      ...rest, // order info
      dataset[2], // 平台
      dataset[3], // 账号名称 aka 名称
      dataset[4], // ID
      dataset[5], // 位置 aka 位置服务
      dataset[7], // 支出
      dataset[8], // 成本
      dataset[9], // 供应商
      dataset[10], // 方式
      planDate, // 发布日期
      dataset[14], // 付款
    ]
  }
}

const apiPaymentDetail = atob("aHR0cDovL3dvcmsudmlnbGxlLmNvbS9QSlRfUGF5bWVudC9Hb1BheU1lbnREZXRhaWw/VGFibGVOYW1lPVBMTi9QTE5fUHJvamVjdEl0ZW0=")

async function SelectPaymentDetail(di, riseCompleteCallback, orderDetail) {
  const [id, ...rest] = orderDetail
  const api = `${apiPaymentDetail}&ID=${id}`
  const element = document.createElement('div')
  element.innerHTML = await dshell.actionTextFetch(di, api, { cors: true })
  try {
    const receiver = element.querySelector('input[name="Payee"]').value
    const bank = element.querySelector('input[name="Bank"]').value
    const account = element.querySelector('input[name="Account"]').value
    return [...rest, receiver, bank, account]
  } catch {
    return [...rest, 'N/A', 'N/A', 'N/A']
  } finally {
    if (riseCompleteCallback) {
      let command = this.ensureAction(riseCompleteCallback)
      await di.exec(command)
    }
  }
}

/* port progress bar to action */

function RiseTotalProgress(_, offset) {
  window.riseTotalProgressBar(offset)
}

function RiseCompleteProgress(_, offset=1) {
  window.riseCompleteProgressBar(offset)
}

export default [SelectActiveOrder, SelectOrderDetail, SelectPaymentDetail, RiseTotalProgress, RiseCompleteProgress]