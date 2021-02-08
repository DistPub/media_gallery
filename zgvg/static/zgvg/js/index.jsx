import {InitedShellContext, ShellContext} from "./context.js"
import ExportVendorForm from './export-vendor-form.jsx'
import ExportActiveOrderButton from './export-active-order-button.jsx'

export default function App(props) {
  const shell = React.useContext(ShellContext)
  const [inited, setInited] = React.useState(false)

  React.useEffect(async () => {
    await shell.init()
    setInited(true)
  }, [])

  return <InitedShellContext.Provider value={inited}>
    <div className="ui divider"/>
    <ExportVendorForm/>
    <div className="ui divider"/>
    <ExportActiveOrderButton/>
  </InitedShellContext.Provider>
}