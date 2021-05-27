import styles from '../css/app.cssm' assert { type: "css" }
import SideBar from './side-bar.jsx';
import ZYTable from './zy-table.jsx';
import BatchOperateZY from './batch-operate-zy.jsx';

const tabs = {
  table: '资源管理',
  batch: '批量操作',
};

export default function App(props) {
  const [tab, setTab] = React.useState('table');

  React.useEffect(() => {
    document.title = `ZYMS画廊 - ${tabs[tab]}`
  }, [tab])

  return <div className={styles.flex}>
    <SideBar tabs={tabs} tabName={tab} showTab={(name) => setTab(name)}/>
    <div className={`${styles['tab-container']}`}>
      {tab === 'table' && <ZYTable/>}
      {tab === 'batch' && <BatchOperateZY/>}
    </div>
  </div>
}