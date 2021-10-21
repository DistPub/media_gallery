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
  const index = [...rows].map(row=>row.querySelector('.name').innerText.toUpperCase()).indexOf(name.toUpperCase())

  if (index === -1) {
    return [name, 'N/A', 'N/A']
  }

  let value
    let desc = 'N/A'

  try {
      value = [...rows][index].querySelector('div.info > p:nth-child(3) > span:nth-child(2) > a').innerText
  } catch (error) {
    value = [...rows][index].querySelector('div.info > p:nth-child(4) > span:nth-child(2) > a').innerText
      desc = [...rows][index].querySelector('div.info > p:nth-child(3)').innerText
  }

    if (value.endsWith('万')) {
      value = value.slice(0,-1) + '0000'
    }
    return [name, value, desc]
}

async function CTextFetch({exec}, api, { cors=true, bodyEncoder=null, headers={}, ...options }={}, body=undefined) {
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

async function makeFlow(shell, names, checked, CallbackName) {
  // change version
  await fetch(atob("aHR0cHM6Ly93ZWliby5jb20vYWpheC9jaGFuZ2V2ZXJzaW9uP3N0YXR1cz02JmNhbGxiYWNrPVNUS18xNjM0ODAwNDIwNTUzNTcmeC1lZGdlLWxvdmVyPWV5Sm9aV0ZrWlhKeklqcDdJbkpsWm1WeVpYSWlPaUpvZEhSd2N6b3ZMM2RsYVdKdkxtTnZiUzhpZlgwPQ=="),
    {mode: 'cors', credentials: 'include'});
  let action = shell.Action
    .map([names]) // name
    .BuildAPI // api
    .CTextFetch // html
    .Collect // [html, html, ...]
    .zipArray([names]) // [[name, html], ...]
    .Map.GetFensi.Collect // [[name, fensi, desc], ...]
    .buildExcel(['data', ['name', 'fensi', 'desc']])
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

        let action = await makeFlow(shell, names, checked, riseCompleteCallbackName);
        const response = await shell.exec(action)
        console.log(response.json())
      }}>导出</SubmitButton>
      <ResetButton onClick={()=>{
        setResource('')
        setChecked(false)
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