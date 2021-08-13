import dshell from 'https://cdn.jsdelivr.net/npm/dshell@1.5.0/dshell.js'
import {ShellContext, context} from "./context.js"
import ExportFensiForm from './export-star-form.jsx';
import ExportHotAccountButton from './export-hot-account-button.jsx';
import {Header} from "./components.jsx";
import WorkerExportDelicacyAccount from "./worker-export-delicacy-account.jsx";

export default function App(props) {
  const [shell, setShell] = React.useState(null)
  const [maxPage, setMaxPage] = React.useState(context.maxPage)
  const [pool, setPool] = React.useState([]);

  React.useEffect(async () => {
    await dshell.init()
    setShell(dshell)

    let status = 0;
    let timer = setInterval(async () => {
      if (status) {
        return;
      }

      status = 1;
      let flow = await requestEdgeLover({ method: "get-flow" })
      if (flow) {
        console.log(`consumeFlow:`, flow)
        flow = [context.maxPage, flow];
        setPool(old => [...old, flow])
      } else {
        console.log('consumeFlow: no flow found')
      }
      status = 0;
    }, 1000);

    return () => {
      clearInterval(timer);
    }
  }, [])

  return <ShellContext.Provider value={shell}>
    <div className="ui divider"/>
    <ExportFensiForm/>
    <div className="ui divider"/>
      <Header title={'批量导出'} subTitle={'请登录相关账号'}/>
    <div className="ui segment">
      <ExportHotAccountButton hotID="6766936376500813837" name="达人指数榜"/>
      <ExportHotAccountButton hotID="6720184315054915588" name="涨粉指数榜"/>
    </div>
    <div className="ui form raised segment">
      <a className="ui red ribbon label">导出设置</a>
      <div className="inline field">
      <label data-tooltip="如果分页数量大于最大页码，最大页码之后的数据不再导出" data-position="right center">最大页码</label>
      <input type="number" value={maxPage} onChange={event=>{
        context.maxPage = parseInt(event.target.value);
        setMaxPage(context.maxPage);
      }}/>
      </div>
    </div>
    <div className="ui form raised segment">
      <a className="ui red ribbon label">导出舞台</a>
      <WorkerExportDelicacyAccount pool={pool}/>
      {pool.length===0 && <div className="ui green message">请在目标页面使用浏览器扩展创建舞台任务</div>}
    </div>
  </ShellContext.Provider>
}