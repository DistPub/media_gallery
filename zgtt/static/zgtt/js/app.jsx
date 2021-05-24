import dshell from 'https://cdn.jsdelivr.net/npm/dshell@1.4.0/dshell.js'
import {ShellContext} from "./context.js"
import ExportFensiForm from './export-star-form.jsx'

export default function App(props) {
  const [shell, setShell] = React.useState(null)

  React.useEffect(async () => {
    await dshell.init()
    setShell(dshell)
  }, [])

  return <ShellContext.Provider value={shell}>
    <div className="ui divider"/>
    <ExportFensiForm/>
  </ShellContext.Provider>
}