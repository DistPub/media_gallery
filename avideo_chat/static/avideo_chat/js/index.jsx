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
  const [show, setShow] = React.useState({1: true, 2: false, 3: false})
  window.toggle = (n) => setShow(v=>{
    const update = {}
    update[n] = !v[n]
    return {...v, ...update}
  })
  console.log(`render root ${JSON.stringify(show)}`)
  return <div>
    {show[1] && <Welcome id={1}/>}
    {show[2] && <Welcome id={2}/>}
    {show[3] && <Welcome id={3}/>}
  </div>
}

ReactDOM.render(<Root/>, root)