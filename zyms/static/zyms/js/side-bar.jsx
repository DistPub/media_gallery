import styles from '../css/side-bar.cssm' assert { type: "css" }

export default function SideBar(props) {
  let tabs = []
  for (let item in props.tabs) {
    tabs.push(
      <a key={item} className={`${props.tabName === item && 'active'} item`} onClick={() => {
        props.showTab(item)
      }}>
        <b>{props.tabs[item]}</b>
      </a>
    )
  }
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
      { tabs }
    </div>
  </div>
}