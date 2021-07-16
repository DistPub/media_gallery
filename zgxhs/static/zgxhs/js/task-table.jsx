import styles from '../css/task-table.cssm' assert {type: 'css'};
import {ShellContext, PouchDBContext} from "./context.js";
import {getPages} from "./utils.js";
import { XLSX } from "https://cdn.jsdelivr.net/npm/dshell@1.4.0/dep.js";
import {Header} from "./components.jsx";
import {statusLabel} from "./consts.js";

async function CBuildExcel(_, sheetName, header, rows) {
  const workbook = XLSX.utils.book_new()
  if (Array.isArray(rows[0])) {
    rows = rows.map(row => {
      const data = {}
      for (const [idx, cell] of row.entries()) {
        data[header[idx]] = cell
      }
      return data
    })
  }
  const sheet = XLSX.utils.json_to_sheet(rows, { header: header })
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName)
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
}

function TransResults(_, task) {
  return []
}

function makeFlow(shell, doc) {
  return shell.Action
    .cBuildExcel(['data', ['username', 'ids'], docs])
    .download(['zyms.xlsx'])
}

export default function TaskTable(props) {
  const db = React.useContext(PouchDBContext);
  const shell = React.useContext(ShellContext);

  const [docs, setDocs] = React.useState([]);
  const [size, setSize] = React.useState(10);
  const [skip, setSkip] = React.useState(0);
  const [pages, setPages] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [navs, setNavs] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [needSync, setNeedSync] = React.useState(false);

  React.useEffect(() => {
    let navs = [];
    for (let page=1;page<=pages;page++) {
      navs.push(<a key={page} className={`${currentPage === page && 'active'} item`} onClick={() => {
        if (currentPage === page) {
          return;
        }
        setCurrentPage(page);
      }}>{page}</a>)
    }
    setNavs(navs);
  }, [pages, currentPage])

  async function showDocs(download=false) {
    let result;

      let filter = {
        selector: {
          type: 'xhs/search/username',
          status: {$gte: null},
          created: {$gte: null},
        },
        sort: [{created: 'desc'}],
        limit: size,
        skip
      }

      result = await db.find(filter);
      result.total_rows = currentPage * size;
      if (size === result.docs.length) {
        result.total_rows += 1;
      } else {
        result.total_rows = (currentPage - 1) * size + result.docs.length;
      }

    ReactDOM.unstable_batchedUpdates(() => {
      setTotal(result.total_rows);
      setPages(getPages(result.total_rows, size));
      setDocs(result.docs);
      setNeedSync(false);
    });
  }

  React.useEffect(()=>{
    setSkip((currentPage-1)*size)
  }, [currentPage]);

  React.useEffect(showDocs, [skip]);

  React.useEffect(() => {
    shell.installExternalAction(CBuildExcel)
    shell.installExternalAction(TransResults)

    let sync = db.changes({
      since: 'now',
      live: true
    }).on('change', () => {
      setNeedSync(true);
    });

    return () => {
      sync.cancel();
    }
  }, [])

  return <>
  <Header title={'任务列表'} subTitle={'当任务状态为已成功时才可以下载任务结果'}/>
  {needSync && <div className="ui segment">
    <div className="ui message">
      <i className="close icon" onClick={() => setNeedSync(false)}></i>
      <div className="header">
        数据已更新，<a className={styles.pointer} onClick={async () => await showDocs()}>立即刷新</a>？
      </div>
      <p>检测到数据有更新，你可以选择立即刷新或者关闭消息。</p>
    </div>
  </div>}
    <table className="ui selectable celled padded table">
  <thead>
    <tr><th>#</th>
    <th>ID</th>
    <th>状态</th>
    <th>创建时间</th>
    <th>操作</th>
  </tr></thead>
  <tbody>
  {docs.map((item, idx) =>
    <tr key={item._id}>
      <td className="center aligned">{skip+idx+1}</td>
      <td className="center aligned">{item._id}</td>
      <td className="center aligned">{statusLabel[item.status]}</td>
      <td className="center aligned">{item.created}</td>
      <td className={`center aligned`}>
          <div className="ui small basic icon buttons">
            {item.status === 2 &&
              <button className="ui button" onClick={async () => {
                const response = await shell.exec(makeFlow(shell, item))
                console.log(response.json())
              }}><i className="edit icon"></i></button>
            }
          </div>
      </td>
    </tr>)}
  </tbody>
  <tfoot>
    <tr><th colSpan="14"><div className="ui middle aligned two column grid">
      <div className="right floated right aligned one column">
        <span className="ui label">
          <i className="signal icon"></i>{total}
        </span>
        <div className="ui pagination menu">
        <a className={`icon ${
          currentPage===1 && 'disabled'
          } item`} onClick={() => {
            if (currentPage===1) {
              return;
            }
            setCurrentPage(currentPage-1);
        }}>
          <i className="left chevron icon"></i>
        </a>
        { navs }
        <a className={`icon ${
        (currentPage === pages || pages === 0) && 'disabled'
          } item`} onClick={()=>{
            if(currentPage===pages){
              return;
            }
            setCurrentPage(currentPage+1);
        }}>
          <i className="right chevron icon"></i>
        </a></div>
      </div></div>
    </th>
  </tr></tfoot>
</table></>
}