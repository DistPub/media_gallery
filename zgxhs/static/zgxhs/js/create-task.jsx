import {LoadingMessage, TextArea, SubmitButton, ResetButton, ModalDialog, Header} from "./components.jsx";
import {ShellContext, ModalContainer, PouchDBContext} from "./context.js";
import uuidv4 from 'https://cdn.jsdelivr.net/npm/uuid@8.3.2/dist/esm-browser/v4.js';

function BuildTask(_, names) {
  return {
    type: 'xhs/search/username',
    _id: uuidv4(),
    status: 0,
    args: names,
    created: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
}

function makeFlow(shell, names) {
  return shell.Action.buildTask([names]).PutTask
}

export default function CreateTask(props) {
  const db = React.useContext(PouchDBContext);
  const shell = React.useContext(ShellContext)
  const modalContainer = React.useContext(ModalContainer)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [resource, setResource] = React.useState('')

  async function PutTask(_, task) {
    let {rev} = await db.put(task);
    task._rev = rev;
    return task
  }

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