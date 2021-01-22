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

function HardInput() {
  // without implement onChang handler
  return <input value={'123'}/>
}

function WrongHardInput() {
  // without implement onChang handler but value is null or undefined
  return <input value={null}/> // equal => NormalInput <input/>
}

function NormalInput() {
  return <input/>
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
    <HardInput/>
    <WrongHardInput/>
    <NormalInput/>
    <Room value={'hi'}/>
    <Mama><p>child</p></Mama>
  </div>
}

function Mama(props) {
  return <div>{props.children}</div>
}

function MyInput(props) {
  return <input value={props.value} onChange={props.updateValue}/>
}

function YourInput(props) {
  return <input value={props.value} onChange={props.updateValue}/>
}

function reverse(value) {
  return Array.from(value).reverse().join('')
}

function Room(props) {
  const [value, setValue] = React.useState(props.value)
  return <div>
    <MyInput value={value} updateValue={(event)=>setValue(event.target.value)}/>
    <YourInput value={reverse(value)} updateValue={(event)=>setValue(reverse(event.target.value))}/>
  </div>
}

ReactDOM.render(<Root/>, root)