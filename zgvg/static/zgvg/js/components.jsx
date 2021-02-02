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