import dshell from 'https://cdn.jsdelivr.net/npm/dshell@1.5.0/dshell.js'
import {ShellContext} from "./context.js"
import ExportFensiForm from './export-star-form.jsx'
import ExportDelicacyAccountButton from "./export-delicacy-account-button.jsx";
import ExportHotAccountButton from './export-hot-account-button.jsx';
import {Header} from "./components.jsx";


export default function App(props) {
  const [shell, setShell] = React.useState(null)

  React.useEffect(async () => {
    await dshell.init()
    setShell(dshell)
  }, [])

  return <ShellContext.Provider value={shell}>
    <div className="ui divider"/>
    <ExportFensiForm/>
    <div className="ui divider"/>
      <Header title={'批量导出'} subTitle={'请登录相关账号'}/>
    <ExportDelicacyAccountButton tag="48" name="导出美食+cpm<20"/>
    <ExportHotAccountButton hotID="6766936376500813837" name="达人指数榜"/>
    <ExportHotAccountButton hotID="6720184315054915588" name="涨粉指数榜"/>
  </ShellContext.Provider>
}