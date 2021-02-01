export function ProgressBar(props) {
  const [total, setTotal] = React.useState(0)
  const [complete, setComplete] = React.useState(0)
  const ref = React.useRef(null)

  React.useEffect(() => {
    window.showProgress = () => ref.current.classList.remove('hidden')
    window.hideProgress = () => ref.current.classList.add('hidden')
    window.resetProgress = () => {
      setTotal(0)
      setComplete(0)
    }
    window.riseTotalProgress = offset => setTotal((old) => old + offset)
    window.riseCompleteProgress = offset => setComplete((old) => old + offset)
  }, [])

  React.useEffect(() => {
    let value

    if (total === 0) {
      value = 0
    } else {
      value = Math.min(Number((complete * 100 / total).toFixed(2)), 100)
    }

    ref.current.dataset.percent = value

    if (value === 0) {
      ref.current.classList.add('active')
      ref.current.classList.remove('success')
    } else if (value === 100) {
      ref.current.classList.remove('active')
      ref.current.classList.add('success')
    }

    ref.current.querySelector('.bar').style.width = ref.current.querySelector('.progress').innerText = `${value}%`
  }, [total, complete])

  return <div ref={ref} className="ui transition hidden small indicating progress">
    <div className="bar">
      <div className="progress"></div>
    </div>
    <div className="label">fetching with ❤️️</div>
  </div>
}