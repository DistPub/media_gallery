const root = document.getElementById('root')

function handler(id, event) {
  console.log(id)
  console.log(event)
  console.log(this)
}

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

  if (time.toLocaleString().slice(-1) === '1') {
    return null
  }
  return <h1 onClick={(event)=>handler(props.id, event)}>Hello, {time.toLocaleTimeString()}</h1>
}

function List(props) {
  return <ul>
    {Array.from(props.list).map(item =>
      <li key={item}>{item}</li>
    )}
  </ul>
}

function Input(props) {
  const [value, setValue] = React.useState(props.value)
  return <input value={value} onChange={(event)=>setValue(event.target.value)}/>
}

function Select(props) {
  const [value, setValue] = React.useState(props.value)
  return <select name={props.name} value={value} onChange={(event)=>{
    console.log(`change ${event.target.name} value to ${event.target.value}`)
    setValue(event.target.value)
  }}>
    <option value={'hi0'}>hi</option>
    <option value={'hi1'}>hi</option>
    <option value={'hi2'}>hi</option>
  </select>
}

function Root() {
  const [show, setShow] = React.useState({1: true, 2: false, 3: false})
  window.toggle = (n) => setShow(v=>{return {...v, [n]: !v[n]}})
  console.log(`render root ${JSON.stringify(show)}`)
  return <div>
    {show[1] && <Welcome id={1}/>}
    {show[2] && <Welcome id={2}/>}
    {show[3] && <Welcome id={3}/>}
    <List list={'abcdefg'}/>
    <Input value={'hello smite'}/>
    <Select value={'hi3'} name={'selectWidget'}/>
  </div>
}

ReactDOM.render(<Root/>, root)