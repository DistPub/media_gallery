import dshell from 'https://cdn.jsdelivr.net/npm/dshell@1.5.0/dshell.js'
import {ShellContext} from "./context.js"
import ExportFensiForm from './export-star-form.jsx'
import ExportDelicacyAccountButton from "./export-delicacy-account-button.jsx";
import ExportHotAccountButton from './export-hot-account-button.jsx';
import {Header} from "./components.jsx";
import {getCode, requestExtension} from "./utils.js";

function Ping(di) {
  console.log('pong')
  return 'pong';
}

function checker(historyRequests) {
  let urls = Object.values(historyRequests).filter(item=>{
    return item.url.startsWith(atob("aHR0cHM6Ly93d3cueGluZ3R1LmNuL3YvYXBpL2RlbWFuZC9hdXRob3JfbGlzdC8="))
  })
  return urls.length && location.href === atob('aHR0cHM6Ly93d3cueGluZ3R1LmNuL2FkL2NyZWF0b3IvbWFya2V0');
}

function maker(historyRequests) {
  let last = Object.values(historyRequests).filter(item=>{
    return item.url.startsWith(atob("aHR0cHM6Ly93d3cueGluZ3R1LmNuL3YvYXBpL2RlbWFuZC9hdXRob3JfbGlzdC8="))
  }).sort((a, b)=>{
    return a.timeStamp<b.timeStamp?1:-1;
  })[0];
  let url = new URL(last.url);
  return Object.fromEntries(url.searchParams.entries());
}

export default function App(props) {
  const [shell, setShell] = React.useState(null)
  const [maxPage, setMaxPage] = React.useState(71)

  React.useEffect(async () => {
    await dshell.init()
    setShell(dshell)
    dshell.installExternalAction(Ping)

    let reply = await requestExtension({
      method: "add-feature-plus",
      name: '批量导出',
      checker: getCode(checker),
      maker: getCode(maker)
    })

    if (reply) {
      console.log(`add feature plus, tab id: ${reply.tab.id}`)
    }

    let status = 0;
    let timer = setInterval(async () => {
      if (status) {
        return;
      }

      status = 1;
      let flow = await requestExtension({ method: "get-flow" })
      if (flow) {
        console.log(`consumeFlow:`, flow)
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
    <div className="ui form raised segment">
      <a className="ui red ribbon label">导出设置</a>
      <div className="inline field">
      <label data-tooltip="如果分页数量大于最大页码，最大页码之后的数据不再导出" data-position="right center">最大页码</label>
      <input type="number" value={maxPage} onChange={event=>setMaxPage(parseInt(event.target.value))}/>
      </div>
    </div>
    <div className="ui segment">
      <ExportDelicacyAccountButton maxPage={maxPage} tag="48" name="美食+cpm<20"/>
      <ExportDelicacyAccountButton maxPage={maxPage} tag="97" name="剧情搞笑+cpm<20"/>
      <ExportDelicacyAccountButton maxPage={maxPage} tag="55" name="母婴亲子+cpm<20"/>
      <ExportDelicacyAccountButton maxPage={maxPage} tag="11" name="萌宠+cpm<20"/>
      <ExportDelicacyAccountButton maxPage={maxPage} tag="75" noCPM={true} name="家居家装"/>
      <ExportDelicacyAccountButton maxPage={maxPage} tag="36" noCPM={true} name="生活小窍门"/>
      <ExportHotAccountButton hotID="6766936376500813837" name="达人指数榜"/>
      <ExportHotAccountButton hotID="6720184315054915588" name="涨粉指数榜"/>
    </div>
  </ShellContext.Provider>
}