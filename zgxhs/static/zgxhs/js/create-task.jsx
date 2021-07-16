import {LoadingMessage, TextArea, SubmitButton, ResetButton, ModalDialog, Header} from "./components.jsx";
import {ShellContext, ModalContainer} from "./context.js";

function BuildTask(_, names) {
  return {}
}

function PutTask(_, task) {
  return task
}

function makeFlow(shell, names) {
  return shell.Action
}

export default function CreateTask(props) {
  const shell = React.useContext(ShellContext)
  const modalContainer = React.useContext(ModalContainer)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [resource, setResource] = React.useState('')
  React.useEffect(async () => {
    shell.installExternalAction(BuildTask)
    shell.installExternalAction(PutTask)

    setLoading(false)
  }, [])

  let view = null

  if (loading) {
    view = <LoadingMessage title={'请稍等'}>加载中...</LoadingMessage>
  } else {
    view = <div className="ui form">
      <div className="field">
        <TextArea value={resource} onChange={(event)=>setResource(event.target.value)}/>
      </div>
      <SubmitButton onClick={async ()=>{
        const names = resource.split('\n').filter(item => item.length > 0)
        if (!names.length) {
          return setError(true)
        }

        const response = await shell.exec(makeFlow(shell, names))
        console.log(response.json())
      }}>创建</SubmitButton>
      <ResetButton onClick={()=>{
        setResource('')
      }}/>
      { error && <ModalDialog title={'错误'} body={'请输入至少一个用户名称！'} container={modalContainer} onClose={
        ()=>setError(false)
      }/>}
    </div>
  }

  return <>
    <Header title={'任务创建'} subTitle={'请在文本框中输入用户名称，每行一个'}/>
    { view }
  </>
}