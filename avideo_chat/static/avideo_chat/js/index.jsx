const root = document.getElementById('root')

function Welcome(props) {
  const [time, setTime] = React.useState(new Date())

  React.useEffect(() => {
    console.log(`${props.id} set interval`)
    const timer = setInterval(() => setTime(oldTime => {
      const newTime = new Date()
      console.log(`${props.id} from old: ${oldTime} to ${newTime}`)
      return newTime
    }), 1000)
    return () => {
      console.log(`${props.id} clear interval`)
      clearInterval(timer)
    }
  }, [])

  console.log(`${props.id} render`)
  return <h1>Hello, {time.toLocaleTimeString()}</h1>
}

function Root() {
  const [show2, setShow2] = React.useState(true)
  window.toggle2 = () => setShow2(v=>!v)
  const [show3, setShow3] = React.useState(true)
  window.toggle3 = () => setShow3(v=>!v)
  return <div>
    <Welcome id={1}/>
    {show2 && <Welcome id={2}/>}
    {show3 && <Welcome id={3}/>}
  </div>
}

ReactDOM.render(<Root/>, root)