import styles from '../css/styles.cssm'

export function CheckListForm(props) {
  return <IconMessage title={props.title ?? '检查清单'} icon={props.icon ?? 'tasks'}>
    <ol className="ui list">{props.children}</ol>
    <button className="ui green button" onClick={props.onClick}>{props.label ?? '完成'}</button>
    {props.ignore && <button className="negative ui button" onClick={props.onIgnore}>{props.ignoreLabel ?? '忽略'}</button>}
  </IconMessage>
}

export function IconMessage(props) {
  return <div className="ui icon message">
    <i className={`${props.icon} icon`}></i>
    <div className="content">
      <div className="header">
        {props.title}
      </div>
      {props.children}
    </div>
  </div>
}

export function LoadingMessage(props) {
  return <div className="ui icon message">
    <i className="notched circle loading icon"></i>
    <div className="content">
      <div className="header">
        {props.title ?? '加载组件'}
      </div>
      <p>{props.children ?? '动态加载组件中...'}</p>
    </div>
  </div>
}

export function ExportButton(props) {
  return <button className="ui green button" onClick={props.onClick}>
    <i className="eye icon"></i>
    {props.children ?? '导出'}
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
    <div className="label">用❤️️充电中</div>
  </div>
}

export function Header(props) {
  return <h2 className="ui header">
    <i className="flag checkered icon"></i>
    <div className="content">
      {props.title}
      <div className="sub header">{props.subTitle}</div>
    </div>
  </h2>
}

export function Label(props) {
  if (!props.label) {
    return null
  }
  return <label htmlFor={props.name} onClick={props.onClick}>{props.label}</label>
}

export function TextArea(props) {
  return <>
    <Label name={props.name} label={props.label}/>
    <textarea name={props.name} value={props.value} onChange={props.onChange}/>
  </>
}

export function SelectOne(props) {
  const options = props.options.map(
    item => <option key={item.value ?? item} value={item.value ?? item}>{item.label ?? item.value ?? item}</option>
  )
  return <>
    <Label name={props.name} label={props.label}/>
    <select name={props.name} value={props.value} onChange={props.onChange}>{options}</select>
  </>
}

export function CheckBox(props) {
  return <div className="ui checkbox">
    <input type="checkbox" tabIndex="0" className="hidden" name={props.name}
           checked={props.checked} onChange={props.onChange}/>
    <Label name={props.name} label={props.label} onClick={props.onClick}/>
  </div>
}

export function SubmitButton(props) {
  return <button className="ui button primary right labeled icon" type="submit" onClick={props.onClick}>
    <i className="rocket icon"></i>{props.children ?? '提交'}
  </button>
}

export function ResetButton(props) {
  return <button className="negative ui button right labeled icon" onClick={props.onClick}>
    <i className="eraser icon"></i>{props.children ?? '重置'}
  </button>
}

export function ModalDialog(props) {
  const ref = React.useRef(null)
  React.useEffect(()=>{
    ref.current.showModal()
  }, [])
  function close() {
    ref.current.close()
    props.onClose()
  }
  const negative = props.negative ?? true

  return ReactDOM.createPortal(<dialog className={styles.dialog} ref={ref} onClick={(event)=>{
    const rect = ref.current.getBoundingClientRect()
    if (event.clientY < rect.top || event.clientY > rect.bottom ||
      event.clientX < rect.left || event.clientX > rect.right) {
      close()
    }
  }}>
    <div className={`ui icon ${negative && 'negative'} large message`}>
      <i className="close icon" onClick={()=>close()}></i>
      <i className="bullhorn icon"></i>
      <div className="content">
        <div className="header modal-message-title">{props.title}</div>
        <p className="modal-message-body">{props.body}</p>
      </div>
    </div>
  </dialog>, props.container)
}