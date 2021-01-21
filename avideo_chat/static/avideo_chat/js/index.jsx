const root = document.getElementById('root')

function Welcome(props) {
  console.log(props)
  const [time, setTime] = React.useState(new Date())

  React.useEffect(() => {
    const timer = setInterval(() => setTime(oldTime => {
      const newTime = new Date()
      console.log(`from old: ${oldTime} to ${newTime}`)
      return newTime
    }), 1000)
    return () => {
      clearInterval(timer)
    }
  }, [])

  return <h1>Hello, {time.toLocaleTimeString()}</h1>
}

ReactDOM.render(<Welcome/>, root)