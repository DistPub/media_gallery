import actions from './actions.js'
import {ProgressBar, LoadingMessage, ExportButton} from "./components.jsx"

async function click(setDisplay, setTotal, setComplete) {
  // reset and show progress bar
  setComplete(0)
  setTotal(0)
  setDisplay(true)

  let action = window.dshell.Action
    .selectActiveOrder([undefined, {action: '/RiseTotalProgress'}]) // => order
    .selectOrderDetail([{action: '/RiseTotalProgress'}, {action: '/RiseCompleteProgress'}]) // => account
    .selectPaymentDetail([{action: '/RiseCompleteProgress'}]) // => account with payment
    .Collect // => [row, ...]
    .buildExcel(['data',
      ["序号", "执行单", "项目名称", "平台", "账号名称", "ID", "位置", "支出", "成本", "供应商", "方式",
        "发布日期", "付款", "收款人", "开户行", "银行账号"]
    ])
    .download({args: ['active_order.xlsx']})

  const response = await window.dshell.exec(action)
  console.log(response.json())
}

export function ExportActiveOrderButton(props) {
  const [loading, setLoading] = React.useState(true)
  React.useEffect(() => {
    const timer = setInterval(async () => {
      try {
        if(window.dshell.userNode.id) {
          clearInterval(timer)

          actions.push(RiseCompleteProgress)
          actions.push(RiseTotalProgress)
          await window.dshell.installModule(actions)

          setLoading(false)
        }
      } catch {
        // dep not resolved
      }
    }, 500)
  }, [])

  const [display, setDisplay] = React.useState(false)
  const [total, setTotal] = React.useState(0)
  const [complete, setComplete] = React.useState(0)

  // todo: action name is global unique
  // but this is temporary for callback, need dynamic generate a random name
  function RiseTotalProgress(_, offset) {
    setTotal(old => old + offset)
  }

  function RiseCompleteProgress(_, offset=1) {
    setComplete(old => old + offset)
  }

  if (loading) {
    return <LoadingMessage title={'请稍等'}>执行单导出功能加载中...</LoadingMessage>
  }

  return <>
    <ProgressBar display={display} total={total} complete={complete}/>
    <ExportButton onClick={async () => await click(setDisplay, setTotal, setComplete)}>执行单导出</ExportButton>
  </>
}