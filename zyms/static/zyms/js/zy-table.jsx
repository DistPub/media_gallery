import {ShellContext, PouchDBContext} from "./context.js";

export default function ZYTable(props) {
  const db = React.useContext(PouchDBContext);
  const shell = React.useContext(ShellContext);

  const [docs, setDocs] = React.useState([]);
  const [title, setTitle] = React.useState(`{
      "platform": "微博",
      "name": "张三分",
      "id": "545616812",
      "category": "种草",
      "follow_number": 4564654,
      "activate": "45%",
      "accounting_period": "30天",
      "pay_category": "对公",
      "vendor": "文档问号",
      "vendor_account": "苏州铃铛文化传播有限公司\
银行：中国银行股份有限公司昆山衡山路支行 \
账号：459871549669"
    }`);

  function addTodo(text) {
    var todo = JSON.parse(text);
    todo._id = `${todo.platform}|${todo.name}`
    db.put(todo, function callback(err, result) {
      if (!err) {
        console.log('Successfully posted a todo!');
      }
    });
  }

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
            <button className="ui button"><i className="edit icon"></i></button>
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
    </th>
  </tr></tfoot>
</table>
    <textarea value={title} onChange={(event)=>setTitle(event.target.value)}/>
    <br/>
    <button onClick={() => addTodo(title)}>add</button>
  </div>
}