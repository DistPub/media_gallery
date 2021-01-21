const root = document.getElementById('root')

function Welcome(props) {
  console.log(props)
  return <h1>Hello, {props.name.toLocaleTimeString()}</h1>
}

setInterval(()=>ReactDOM.render(<Welcome name={new Date()}/>, root), 1000)