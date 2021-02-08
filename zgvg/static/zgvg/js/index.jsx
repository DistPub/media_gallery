import {InitedShellContext, ShellContext} from "./context.js"
import ExportVendorForm from './export-vendor-form.jsx'
import ExportActiveOrderButton from './export-active-order-button.jsx'
import {CheckListForm, LoadingMessage} from './components.jsx'

export default function App(props) {
  const shell = React.useContext(ShellContext)
  const [inited, setInited] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [chromeError, setChromeError] = React.useState(false)
  const [connectError, setConnectError] = React.useState(false)

  React.useEffect(async () => {
    if (!loading) {
      return
    }

    try {
      const response = await fetch(atob('aHR0cDovL3dvcmsudmlnbGxlLmNvbS9JbmRleC9JbmRleA=='),
        {mode: 'cors', credentials: 'include'})

      if (response.redirected || !response.ok) {
        setConnectError(true)
      }
    } catch (error) {
      setChromeError(true)
    } finally {
      setLoading(false)
    }
  }, [loading])

  React.useEffect(async () => {
    await shell.init()
    setInited(true)
  }, [])

  function reCheck() {
    setLoading(true)
    setChromeError(false)
    setConnectError(false)
  }

  if (loading) {
    return <LoadingMessage title={'请稍等'}>正在检查您的浏览器环境是否满足要求...</LoadingMessage>
  }

  if (chromeError) {
    return <CheckListForm title={'Chrome配置错误，请检查'} icon={'chrome'} onClick={()=>reCheck()}>
      <li><img width='100%' src={new URL('../images/mix-content-enable.png', import.meta.url).href}/>
        如图允许<a className='ui red label'>不安全内容</a></li>
      <li><img width='100%' src={new URL('../images/cors-options.png', import.meta.url).href}/>
        如图配置扩展<a className='ui red label'>Allow CORS: Access-Control-Allow-origin</a></li>
      <li><img width='100%' src={new URL('../images/cors-status-on.png', import.meta.url).href}/>
        如图确保扩展<a className='ui red label'>Allow CORS: Access-Control-Allow-origin</a>处于开启状态</li>
    </CheckListForm>
  }

  if (connectError) {
    return <CheckListForm title={'网络请求权限错误，请检查'} icon={'minus circle'} label="已检查，继续" onClick={()=>reCheck()}
                          ignore={true} onIgnore={()=>setConnectError(false)}>
      <li>已经登录系统</li>
      <li><img width='100%' src={new URL('../images/disabled-same-site-by-default-cookies.png', import.meta.url).href}/>
        如图已经关闭Chrome flag<a className='ui red label'>chrome://flags/#same-site-by-default-cookies</a></li>
    </CheckListForm>
  }

  return <InitedShellContext.Provider value={inited}>
    <div className="ui divider"/>
    <ExportVendorForm/>
    <div className="ui divider"/>
    <ExportActiveOrderButton/>
  </InitedShellContext.Provider>
}