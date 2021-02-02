import {ProgressBar, LoadingMessage, ExportButton} from "./components.jsx"

export function ExportActiveOrderButton(props) {
  const [loading, setLoading] = React.useState(true)
  React.useEffect(() => {
    const timer = setInterval(async () => {
      try {
        if(window.dshell.userNode.id) {
          clearInterval(timer)
          await window.dshell.installModule(window.exportActiveOrder.actions)
          setLoading(false)
        }
      } catch {
        // dep not resolved
      }
    }, 500)
  }, [])

  if (loading) {
    return <LoadingMessage title={'请稍等'}>执行单导出功能加载中...</LoadingMessage>
  }

  return <>
    <ProgressBar display={false} total={0} complete={0}/>
    <ExportButton onClick={window.exportActiveOrder.click}>执行单导出</ExportButton>
  </>
}