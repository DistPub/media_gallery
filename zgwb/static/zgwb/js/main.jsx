const Validator = React.lazy(()=>import('./chrome-validator.jsx'))
const App = React.lazy(()=>import('./app.jsx'))

export default function Main(props) {
  const [pass, setPass] = React.useState(false)
  return <React.Suspense fallback={<>{pass?'应用加载中...':'Chrome检查组件加载中...'}</>}>
    {pass?<App/>:<Validator onPass={()=>setPass(true)}/>}
  </React.Suspense>
}