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

  function showDocs() {
    db.allDocs({include_docs: true, descending: true, limit: size, skip}, function(err, doc) {
      setTotal(doc.total_rows);
      setPages(getPages(doc.total_rows, size));
      setDocs(doc.rows);
    });
  }

  React.useEffect(()=>{
    setSkip((currentPage-1)*size)
  }, [currentPage]);

  React.useEffect(showDocs, [skip]);

  React.useEffect(() => {
    showDocs();

    let sync = db.changes({
      since: 'now',
      live: true
    }).on('change', showDocs);

    return () => {
      sync.cancel();
    }
  }, [])

  return <div className="ui segment">
    { addDoc && <ModalDialog title={'添加资源'} body={<AddDocForm closeForm={() => setAddDoc(false)}/>} container={modalContainer} onClose={
        ()=>setAddDoc(false)
      } negative={false} showIcon={false}/>}
      { editDoc && <ModalDialog title={'编辑资源'} body={<AddDocForm closeForm={() => setEditDoc(null)} doc={editDoc}/>} container={modalContainer} onClose={
        ()=>setEditDoc(null)
      } negative={false} showIcon={false}/>}
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
    <tr key={item.key}>
      <td className="center aligned">{idx+1}</td>
      <td className="center aligned">{item.doc.platform}</td>
      <td className="center aligned">{item.doc.name}</td>
      <td className="center aligned">{item.doc.id}</td>
      <td className="center aligned">{item.doc.category}</td>
      <td className="center aligned">{item.doc.follow_number}</td>
      <td className="center aligned">{item.doc.activate}</td>
      <td className="center aligned">{item.doc.accounting_period}</td>
      <td className="center aligned">{item.doc.pay_category}</td>
      <td className="center aligned">{item.doc.vendor}</td>
      <td>{item.doc.vendor_account}</td>
      <td className="center aligned">
          <div className="ui small basic icon buttons">
            <button className="ui button" onClick={() => setEditDoc(item.doc) }><i className="edit icon"></i></button>
            <button className="ui button" onClick={() => {
              db.remove(item.doc);
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
  </div>
}