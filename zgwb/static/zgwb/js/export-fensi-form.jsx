import {
  ProgressBar,
  LoadingMessage,
  CheckBox, Header,
  ResetButton,
  SubmitButton,
  TextArea,
  ModalDialog
} from "./components.jsx"
import {ShellContext, ModalContainer} from './context.js'

function BuildAPI(_, name) {
  return `${atob("aHR0cHM6Ly9zLndlaWJvLmNvbS91c2VyLw==")}${name}`
}

function GetFensi(_, data) {
  let [name, html] = data
  html = html.replace(/<img\b/ig, '<imgkiller')

  const element = document.createElement('div')
  element.innerHTML = html
  const rows = element.querySelectorAll('#pl_user_feedList .card')
  const index = [...rows].map(row=>row.querySelector('.name').innerText).indexOf(name)

  if (index === -1) {
    return 'N/A'
  }

  let value

  try {
      value = [...rows][index].querySelector('div.info > p:nth-child(3) > span:nth-child(2) > a').innerText
  } catch (error) {
    value = [...rows][index].querySelector('div.info > p:nth-child(4) > span:nth-child(2) > a').innerText
  }

    if (value.endsWith('万')) {
      return value.slice(0,-1) + '0000'
    }
    return value
}

async function CTextFetch({exec}, api, { cors=false, bodyEncoder=null, headers={}, ...options }={}, body=undefined) {
  await exec(this.Action.RiseCompleteProgress)

  if (bodyEncoder === 'form') {
    const data = new URLSearchParams()
    for (const [key, value] of Object.entries(body)) {
      data.append(key, value)
    }
    options.body = data
  } else if (bodyEncoder === 'json') {
    options.body = JSON.stringify(body)
    headers['content-type'] = 'application/json'
  }
  if (cors) {
    options.mode = 'cors'
    options.credentials = "include"
  }
  const response = await window.fetch(api, {headers, ...options})
  return await response.text()
}

function makeFlow(shell, names, checked, CallbackName) {
  let action = shell.Action
    .map([names]) // name
    .BuildAPI // api
    .CTextFetch // html
    .Collect // [html, html, ...]
    .zipArray([names]) // [[name, html], ...]
    .Map.GetFensi.Collect // [fensi, ...]
    .zipArray([names]) // [[name, fensi], ...]
    .buildExcel(['data', ['name', 'fensi']])
    .download(['fensi.xlsx'])

  if (checked) {
    action = action.pushFile(['/tmp/fensi.xlsx']).PreviewOffice
  }
  return action
}

export default function ExportFensiForm(props) {
  const shell = React.useContext(ShellContext)
  const modalContainer = React.useContext(ModalContainer)
  const [loading, setLoading] = React.useState(true)
  const [display, setDisplay] = React.useState(false)
  const [total, setTotal] = React.useState(0)
  const [complete, setComplete] = React.useState(0)
  const [checked, setChecked] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [resource, setResource] = React.useState('')
  const [riseCompleteCallbackName, setRiseCompleteCallbackName] = React.useState('RiseCompleteProgress')

  function RiseCompleteProgress(_) {
    setComplete(old => old + 1)
  }

  React.useEffect(async () => {
    if (!shell) {
      return
    }

    shell.installExternalAction(BuildAPI)
    shell.installExternalAction(GetFensi)
    shell.installExternalAction(CTextFetch)
    shell.installExternalAction(RiseCompleteProgress)

    setLoading(false)
  }, [shell])

  let view = null

  if (loading) {
    view = <LoadingMessage title={'请稍等'}>粉丝数量导出功能加载中...</LoadingMessage>
  } else {
    view = <div className="ui form">
      <div className="field">
        <TextArea value={resource} onChange={(event)=>setResource(event.target.value)}/>
      </div>
      <div className="inline fields">
        <div className="field">
          <CheckBox name={'preview'} label={'在线预览导出文件'} checked={checked}
                    onChange={() => setChecked(old => !old)}
                    onClick={() => setChecked(old => !old)}/>
        </div>
      </div>
      <ProgressBar display={display} total={total} complete={complete}/>
      <SubmitButton onClick={async ()=>{
        const names = resource.split('\n').filter(item => item.length > 0)
        if (!names.length) {
          return setError(true)
        }

        setComplete(0)
        setTotal(names.length)
        setDisplay(true)

        const response = await shell.exec(makeFlow(shell, names, checked, riseCompleteCallbackName))
        console.log(response.json())
      }}>导出</SubmitButton>
      <ResetButton onClick={()=>{
        setResource('')
        setChecked(false)
        setBrand(brandOptions[0])
        setDisplay(false)
      }}/>
      { error && <ModalDialog title={'错误'} body={'请输入至少一个用户名称！'} container={modalContainer} onClose={
        ()=>setError(false)
      }/>}
    </div>
  }

  return <>
    <Header title={'粉丝数量导出'} subTitle={'请在文本框中用户名称，每行一个'}/>
    { view }
  </>
}