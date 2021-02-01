const apiActiveOrderList = atob("aHR0cDovL3dvcmsudmlnbGxlLmNvbS9CYXNlVGFibGUvSW5kZXgvSW5kZXg/VGFibGVOYW1lPVBMTi9QTE5fUHJvamVjdA==")

async function* SelectActiveOrder(_, api=apiActiveOrderList) {
  const element = document.createElement('div')
  element.innerHTML = await dshell.actionTextFetch([api, { cors: true }])
  for (const row of element.querySelectorAll('#rwd tbody tr')) {
    const id = row.getAttribute('id')
    const dataset = Array.from(row.querySelectorAll('td')).map(item=>item.innerText)
    yield [
      id, // meta id
      dataset[0], // 序号
      dataset[2], // 执行单 aka 项目编码
      dataset[3], // 项目名称
    ]
  }
  const nextApi = element.querySelector('.pagination [aria-label="Next"]').getAttribute('href')
  if (nextApi !== '#') {
    yield* SelectActiveOrder(null, nextApi)
  }
}

const apiOrderDetail = atob("aHR0cDovL3dvcmsudmlnbGxlLmNvbS9CYXNlVGFibGUvRWRpdC8/VGFibGVOYW1lPVBMTi9QTE5fUHJvamVjdCZFeHRlbmQ9JlNlYXJjaEZpZWxkPQ==")

async function* SelectOrderDetail(_, order) {
  const [orderID, ...rest] = order
  const api = `${apiOrderDetail}&ID=${orderID}`
  const element = document.createElement('div')
  element.innerHTML = await dshell.actionTextFetch([api, { cors: true }])
  for (const row of element.querySelectorAll('#PLN_ProjectItem tbody tr.table-item')) {
    const id = row.getAttribute('id')
    const planDate = row.querySelector('.PlanDate input').value
    const dataset = Array.from(row.querySelectorAll('td')).map(item=>item.innerText)
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

async function SelectPaymentDetail(_, orderDetail) {
  const [id, ...rest] = orderDetail
  const api = `${apiPaymentDetail}&ID=${id}`
  const element = document.createElement('div')
  element.innerHTML = await dshell.actionTextFetch([api, { cors: true }])
  try {
    const receiver = element.querySelector('input[name="Payee"]').value
    const bank = element.querySelector('input[name="Bank"]').value
    const account = element.querySelector('input[name="Account"]').value
    return [...rest, receiver, bank, account]
  } catch {
    return [...rest, 'N/A', 'N/A', 'N/A']
  }
}

export default [SelectActiveOrder, SelectOrderDetail, SelectPaymentDetail]