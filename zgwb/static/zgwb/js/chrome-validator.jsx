import {LoadingMessage, CheckListForm} from "./components.jsx";

export default function ChromeValidator(props) {
  const [loading, setLoading] = React.useState(true)
  const [chromeError, setChromeError] = React.useState(false)
  const [connectError, setConnectError] = React.useState(false)

  React.useEffect(async () => {
    if (!loading) {
      return
    }

    // check extension
    if (!window.requestEdgeLover) {
      setChromeError(true)
      setLoading(false)
      return
    }

    let whitelist = await requestEdgeLover({ method: "get-whitelist" })
    let host = atob("aHR0cHM6Ly9zLndlaWJvLmNvbQ==")

    if (!whitelist.includes(host)) {
      await requestEdgeLover({ method: "add-whitelist", data: host })
    }
    setLoading(false);
  }, [loading])

  React.useEffect(()=> {
    if (!loading && !chromeError && !connectError) {
      props.onPass()
    }
  }, [loading, chromeError, connectError])

  function reCheck() {
    setChromeError(false)
    setConnectError(false)
    setLoading(true)
  }

  if (loading) {
    return <LoadingMessage title={'请稍等'}>正在检查您的浏览器环境是否满足要求...</LoadingMessage>
  }

  if (chromeError) {
    return <CheckListForm title={'Chrome配置错误，请检查'} icon={'chrome'} onClick={()=>location.reload()}>
      <li>确保安装最新版本【Escape Cookie SameSite Policy】浏览器扩展</li>
    </CheckListForm>
  }

  return null
}