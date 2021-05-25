import {ShellContext, PouchDBContext, ModalContainer} from "./context.js";
import {ModalDialog} from './components.jsx';
import AddDocForm from './add-doc-form.jsx';
import {getPages} from "./utils.js";

export default function ZYTable(props) {
  const db = React.useContext(PouchDBContext);
  const shell = React.useContext(ShellContext);
  const modalContainer = React.useContext(ModalContainer)

  const [docs, setDocs] = React.useState([]);
  const [addDoc, setAddDoc] = React.useState(false);
  const [editDoc, setEditDoc] = React.useState(null);
  const [size, setSize] = React.useState(50);
  const [skip, setSkip] = React.useState(0);
  const [pages, setPages] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [navs, setNavs] = React.useState([]);
  const [total, setTotal] = React.useState(0);

  const [searchKey, setSearchKey] = React.useState('');
  const [search, setSearch] = React.useState('');
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

  async function showDocs() {
    let result;

    if (search) {
      if (currentPage !== 1) {
        setCurrentPage(1);
        return;
      }

      result = await db.find({
        selector: {
          $or: [{name: {$regex: search}},{id: {$regex: search}}]
        },
        limit: size,
        skip
      });
      result.total_rows = result.docs.length;
    } else {
      result = await db.allDocs({include_docs: true, descending: true, limit: size, skip});
      result.rows = result.rows.map(item=>{
        return {...item.doc};
      });
    }

    setTotal(result.total_rows);
    setPages(getPages(result.total_rows, size));
    setDocs(result.rows ?? result.docs);
  }

  React.useEffect(()=>{
    setSkip((currentPage-1)*size)
  }, [currentPage]);

  React.useEffect(showDocs, [skip, search]);

  React.useEffect(() => {
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
  {needSync && <div className="ui segment">
    <div className="ui message">
      <i className="close icon" onClick={() => setNeedSync(false)}></i>
      <div className="header">
        有新数据，<a href="#" onClick={() => {
          showDocs();
          setNeedSync(false);
      }}>立即刷新</a>？
      </div>
      <p>检测到数据有更新，你可以选择立即刷新或者关闭消息。</p>
    </div>
  </div>}
  <div className="ui segment">
    <div className="ui action input">
      <input tabIndex="0" type="text" placeholder="Search..." value={searchKey}
             onChange={event => setSearchKey(event.target.value)}
             onKeyPress={event => {
               if (event.key === 'Enter') {
                 setSearch(searchKey)
               }
             }}/>
  <button className="ui icon button" onClick={() => setSearch(searchKey)}>
    <i className="search icon"></i>
  </button>
</div>
  </div>
  <div className="ui segment">
    { addDoc && <ModalDialog title={'添加资源'} body={<AddDocForm closeForm={() => setAddDoc(false)}/>} container={modalContainer} onClose={
        ()=>setAddDoc(false)
      } negative={false} showIcon={false} blurClose={false}/>}
      { editDoc && <ModalDialog title={'编辑资源'} body={<AddDocForm closeForm={() => setEditDoc(null)} doc={editDoc}/>} container={modalContainer} onClose={
        ()=>setEditDoc(null)
      } negative={false} showIcon={false} blurClose={false}/>}
    <table className="ui selectable celled padded table">
  <thead>
    <tr><th>#</th>
    <th>平台</th>
    <th>账号名称</th>
    <th>ID/链接</th>
    <th>类别</th>
    <th>粉丝量</th>
    <th>粉丝活跃度</th>
    <th>账期</th>
    <th>付款形式</th>
    <th>供应商名称</th>
    <th>供应商账户</th>
    <th>操作</th>
  </tr></thead>
  <tbody>
  {docs.map((item, idx) =>
    <tr key={item._id}>
      <td className="center aligned">{idx+1}</td>
      <td className="center aligned">{item.platform}</td>
      <td className="center aligned">{item.name}</td>
      <td className="center aligned">{item.id}</td>
      <td className="center aligned">{item.category}</td>
      <td className="center aligned">{item.follow_number}</td>
      <td className="center aligned">{item.activate}</td>
      <td className="center aligned">{item.accounting_period}</td>
      <td className="center aligned">{item.pay_category}</td>
      <td className="center aligned">{item.vendor}</td>
      <td>{item.vendor_account}</td>
      <td className="center aligned">
          <div className="ui small basic icon buttons">
            <button className="ui button" onClick={() => setEditDoc(item) }><i className="edit icon"></i></button>
            <button className="ui button" onClick={() => {
              db.remove(item);
              let pages = getPages(total - 1, size);
              if (currentPage>pages) {
                setCurrentPage(1);
              }
            }}><i className="remove icon"></i></button>
          </div>
      </td>
    </tr>)}
  </tbody>
  <tfoot>
    <tr><th colSpan="12">
      <div className="ui right floated pagination menu">
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
          currentPage === pages && 'disabled'
          } item`} onClick={()=>{
            if(currentPage===pages){
              return;
            }
            setCurrentPage(currentPage+1);
        }}>
          <i className="right chevron icon"></i>
        </a>
      </div>
          <div className="ui left floated"><button className="positive ui button" onClick={() => setAddDoc(true)}>新增</button></div>
    </th>
  </tr></tfoot>
</table>
  </div></>
}