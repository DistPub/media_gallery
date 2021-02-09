import dshell from 'https://cdn.jsdelivr.net/npm/dshell@1.4.0/dshell.js'
import {ShellContext} from "./context.js"
import ExportVendorForm from './export-vendor-form.jsx'
import ExportActiveOrderButton from './export-active-order-button.jsx'

export default function App(props) {
  const [shell, setShell] = React.useState(null)

  React.useEffect(async () => {
    await dshell.init()
    setShell(dshell)
  }, [])

  return <ShellContext.Provider value={shell}>
    <div className="ui divider"/>
    <ExportVendorForm/>
    <div className="ui divider"/>
    <ExportActiveOrderButton/>
  </ShellContext.Provider>
}