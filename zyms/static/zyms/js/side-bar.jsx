import styles from '../css/side-bar.cssm' assert { type: "css" }

export default function SideBar(props) {
  return <div id={styles.wrapper}>
    <div className={`${styles['side-bar']} ui vertical inverted menu`}>
      <div className="item">
        <h2 className="ui inverted header">
          <i className="plug icon"></i>
          <div className="content">
            ZYMS画廊
          </div>
        </h2>
      </div>
      <a className={`${props.tabName === 'table' && 'active'} item`} onClick={() => {
        props.showTab('table')
      }}>
        <b>资源管理</b>
      </a>
      <a className={`${props.tabName === 'batch' && 'active'} item`} onClick={() => {
        props.showTab('batch')
      }}>
        <b>批量操作</b>
      </a>
    </div>
  </div>
}