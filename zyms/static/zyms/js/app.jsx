import styles from '../css/app.cssm' assert { type: "css" }
import SideBar from './side-bar.jsx';
import ZYTable from './zy-table.jsx';

export default function App(props) {
  const [tab, setTab] = React.useState('table');

  return <div className={styles.flex}>
    <SideBar tabName={tab} showTab={(name) => setTab(name)}/>
    <div className={`${styles['tab-container']}`}>
      {tab === 'table' && <ZYTable/>}
    </div>
  </div>
}