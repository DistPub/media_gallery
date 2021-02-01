async function exportActiveOrder() {
  let action = dshell.Action
    .SelectActiveOrder // => order
    .SelectOrderDetail // => account
    .SelectPaymentDetail // => account with payment
    .Collect // => [row, ...]
    .buildExcel(['data',
      ["序号", "执行单", "项目名称", "平台", "账号名称", "ID", "位置", "支出", "成本", "供应商", "方式",
        "发布日期", "付款", "收款人", "开户行", "银行账号"]
    ])
    .download({args: ['active_order.xlsx']})

  const response = await dshell.exec(action)
  console.log(response.json())
}

function Root(props) {
  const [depStatus, setDepStatus] = React.useState(false)
  const notReadyUI = <div className="ui icon message">
    <i className="notched circle loading icon"></i>
    <div className="content">
      <div className="header">
        请稍等
      </div>
      <p>执行单导出功能加载中...</p>
    </div>
  </div>

  React.useEffect(() => {
    const timer = setInterval(async () => {
      try {
        if(dshell.userNode.node.isStarted()) {
          clearInterval(timer)
          await dshell.installModule(`${appStaticURL}js/actions.js`)
          setDepStatus(true)
        }
      } catch {
        // dep not resolved
      }
    }, 500)
  }, [])

  if (!depStatus) {
    return notReadyUI
  }

  return <button className="ui green button" onClick={exportActiveOrder}>
    <i className="eye icon"></i>
    执行单导出
  </button>
}

ReactDOM.render(<Root/>, document.querySelector('#root'))