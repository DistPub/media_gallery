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
      <li><img width='100%' src={absURL('../images/cors-options.png', import.meta.url)}/>
        如图配置扩展<a className='ui red label'>Allow CORS: Access-Control-Allow-origin</a></li>
      <li><img width='100%' src={absURL('../images/cors-status-on.png', import.meta.url)}/>
        如图确保扩展<a className='ui red label'>Allow CORS: Access-Control-Allow-origin</a>处于开启状态</li>
    </CheckListForm>
  }

  if (connectError) {
    return <CheckListForm title={'网络请求权限错误，请检查'} icon={'minus circle'} label="已检查，继续" onClick={()=>reCheck()}
                          ignore={true} onIgnore={()=>setConnectError(false)}>
      <li>已经登录系统</li>
      <li><img width='100%' src={absURL('../images/escape-same-site-policy-extension.png', import.meta.url)}/>
        如图配置<a className='ui red label'>Escape Cookie SameSite Policy</a></li>
    </CheckListForm>
  }

  return null
}