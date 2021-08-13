import {LoadingMessage, CheckListForm} from "./components.jsx";
import {absURL} from "./utils.js";

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
    let host = atob("aHR0cHM6Ly93d3cueGluZ3R1LmNu")

    if (!whitelist.includes(host)) {
      await requestEdgeLover({ method: "add-whitelist", data: host })
    }

    host = atob("aHR0cHM6Ly9zc28ub2NlYW5lbmdpbmUuY29t")
    if (!whitelist.includes(host)) {
      await requestEdgeLover({ method: "add-whitelist", data: host })
    }

    try {
      const response = await fetch(atob("aHR0cHM6Ly93d3cueGluZ3R1LmNuL3YvYXBpL3VzZXIvaW5mby8="),
        {mode: 'cors', credentials: 'include'})
      const data = await response.json()

      if (data.code === 11001) {
        setConnectError(true)
      }
    } catch (error) {
      setChromeError(true)
    } finally {
      setLoading(false)
    }
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
    return <CheckListForm title={'Chrome配置错误，请检查'} icon={'chrome'} onClick={()=>reCheck()}>
      <li>确保安装最新版本【Escape Cookie SameSite Policy】浏览器扩展</li>
    </CheckListForm>
  }

  if (connectError) {
    return <CheckListForm title={'网络请求权限错误，请检查'} icon={'minus circle'} label="已检查，继续" onClick={()=>reCheck()}
                          ignore={true} onIgnore={()=>setConnectError(false)}>
      <li>已经登录系统</li>
      <li>尝试退出重新登录系统</li>
    </CheckListForm>
  }

  return null
}