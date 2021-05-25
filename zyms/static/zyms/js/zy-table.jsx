import {ShellContext, PouchDBContext, ModalContainer} from "./context.js";
import {ModalDialog} from './components.jsx';
import AddDocForm from './add-doc-form.jsx';

export default function ZYTable(props) {
  const db = React.useContext(PouchDBContext);
  const shell = React.useContext(ShellContext);
  const modalContainer = React.useContext(ModalContainer)

  const [docs, setDocs] = React.useState([]);
  const [addDoc, setAddDoc] = React.useState(false);
  const [editDoc, setEditDoc] = React.useState(null);

  function showTodos() {
    db.allDocs({include_docs: true, descending: true}, function(err, doc) {
      setDocs(doc.rows);
    });
  }

  React.useEffect(() => {
    showTodos();

    let sync = db.changes({
      since: 'now',
      live: true
    }).on('change', showTodos);

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
    <table className="ui celled padded table">
  <thead>
    <tr><th className="single line">平台</th>
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
  {docs.map(item =>
    <tr key={item.key}>
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
            <button className="ui button" onClick={() => db.remove(item.doc)}><i className="remove icon"></i></button>
          </div>
      </td>
    </tr>)}
  </tbody>
  <tfoot>
    <tr><th colSpan="11">
      <div className="ui right floated pagination menu">
        <a className="icon item">
          <i className="left chevron icon"></i>
        </a>
        <a className="item">1</a>
        <a className="item">2</a>
        <a className="item">3</a>
        <a className="item">4</a>
        <a className="icon item">
          <i className="right chevron icon"></i>
        </a>
      </div>
          <div className="ui left floated"><button className="positive ui button" onClick={() => setAddDoc(true)}>新增</button></div>
    </th>
  </tr></tfoot>
</table>
  </div>
}