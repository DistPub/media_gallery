export function LoadingMessage(props) {
  return <div className="ui icon message">
    <i className="notched circle loading icon"></i>
    <div className="content">
      <div className="header">
        {props.title}
      </div>
      <p>{props.children}</p>
    </div>
  </div>
}

export function ExportButton(props) {
  return <button className="ui green button" onClick={props.onClick}>
    <i className="eye icon"></i>
    {props.children}
  </button>
}

export function ProgressBar(props) {
  const {total, complete, display} = props
  const percent = total === 0 ? 0 : Math.min(Number((complete * 100 / total).toFixed(2)), 100)
  return <div className={`ui transition small indicating progress ${
    !display && 'hidden'
  } ${
    percent === 0 ? 'active' : 'success'
  }`} data-percent={percent}>
    <div className="bar" style={{width: `${percent}%`}}>
      <div className="progress">{`${percent}%`}</div>
    </div>
    <div className="label">fetching with ❤️️</div>
  </div>
}