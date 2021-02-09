import {
  ProgressBar,
  LoadingMessage,
  ExportButton,
  Header
} from "./components.jsx"
import {ShellContext} from './context.js'
import {generateID} from './utils.js'

function makeFlow(shell, riseTotalCallbackName, riseCompleteCallbackName) {
  return shell.Action
    .selectActiveOrder([undefined, {action: `/${riseTotalCallbackName}`}]) // => order
    .selectOrderDetail([
      {action: `/${riseTotalCallbackName}`},
      {action: `/${riseCompleteCallbackName}`}]) // => account
    .selectPaymentDetail([{action: `/${riseCompleteCallbackName}`}]) // => account with payment
    .Collect // => [row, ...]
    .buildExcel(['data',
      ["序号", "执行单", "项目名称", "平台", "账号名称", "ID", "位置", "支出", "成本", "供应商", "方式",
        "发布日期", "付款", "收款人", "开户行", "银行账号"]
    ])
    .download({args: ['active_order.xlsx']})
}

export default function ExportActiveOrderButton(props) {
  const shell = React.useContext(ShellContext)
  const [loading, setLoading] = React.useState(true)
  const [display, setDisplay] = React.useState(false)
  const [total, setTotal] = React.useState(0)
  const [complete, setComplete] = React.useState(0)
  const [riseTotalCallbackName, setRiseTotalCallbackName] = React.useState('RiseTotalProgress')
  const [riseCompleteCallbackName, setRiseCompleteCallbackName] = React.useState('RiseCompleteProgress')

  function RiseTotalProgress(_, offset) {
    setTotal(old => old + offset)
  }

  function RiseCompleteProgress(_, offset=1) {
    setComplete(old => old + offset)
  }

  React.useEffect(async () => {
    if (!shell) {
      return
    }

    await shell.installModule(new URL('./export-active-order-actions.js', import.meta.url).href)

    let value = generateID('RiseTotalProgress')
    Object.defineProperty(RiseTotalProgress, 'name', { value })
    setRiseTotalCallbackName(value)
    shell.installExternalAction(RiseTotalProgress)

    value = generateID('RiseCompleteProgress')
    Object.defineProperty(RiseCompleteProgress, 'name', { value })
    setRiseCompleteCallbackName(value)
    shell.installExternalAction(RiseCompleteProgress)

    setLoading(false)
  }, [shell])

  let view = null

  if (loading) {
    view = <LoadingMessage title={'请稍等'}>执行单导出功能加载中...</LoadingMessage>
  } else {
    view = <>
      <ProgressBar display={display} total={total} complete={complete}/>
      <ExportButton onClick={async () => {
        setComplete(0)
        setTotal(0)
        setDisplay(true)

        const response = await shell.exec(makeFlow(shell, riseTotalCallbackName, riseCompleteCallbackName))
        console.log(response.json())
      }}/>
    </>
  }

  return <>
    <Header title={'执行单导出'} subTitle={'导出速度与执行单中账号数量是正相关的'}/>
    { view }
  </>
}