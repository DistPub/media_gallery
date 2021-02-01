function installAction() {
  console.log(`installed`)
}

function exportActiveOrder() {
  console.log(`exported`)
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
    const timer = setInterval(() => {
      try {
        if(dshell.userNode.node.isStarted()) {
          clearInterval(timer)
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

  installAction()

  return <button className="ui green button" onClick={exportActiveOrder}>
    <i className="eye icon"></i>
    执行单导出
  </button>
}

ReactDOM.render(<Root/>, root)