import {ShellContext, PouchDBContext} from "./context.js";

export default function ZYTable(props) {
  const db = React.useContext(PouchDBContext);
  const shell = React.useContext(ShellContext);

  const [todos, setTodos] = React.useState([]);
  const [title, setTitle] = React.useState('');

  function addTodo(text) {
    var todo = {
      _id: new Date().toISOString(),
      title: text,
      completed: false
    };
    db.put(todo, function callback(err, result) {
      if (!err) {
        console.log('Successfully posted a todo!');
      }
    });
  }

  function showTodos() {
    db.allDocs({include_docs: true, descending: true}, function(err, doc) {
      setTodos(doc.rows);
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
    <tr>
      <td className="center aligned">微博</td>
      <td className="center aligned">张三分</td>
      <td className="center aligned">545616812</td>
      <td className="center aligned">种草</td>
      <td className="center aligned">4564654</td>
      <td className="center aligned">45%</td>
      <td className="center aligned">30天</td>
      <td className="center aligned">对公</td>
      <td className="center aligned">文档问号</td>
      <td>Creatine supplementation is the reference compound for increasing muscular creatine levels; there is variability in this increase, however, with some nonresponders.</td>
      <td className="center aligned">
          <div class="ui small basic icon buttons">
            <button class="ui button"><i class="edit icon"></i></button>
            <button class="ui button"><i class="remove icon"></i></button>
          </div>
      </td>
    </tr>
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
    <input onChange={(event)=>setTitle(event.target.value)} />
    <br/>
    <button onClick={() => addTodo(title)}>add</button>
    <div className="ui divider"/>
    <ul>
        {todos.map(item => <li key={item.key}>{item.doc.title}
          <button onClick={() => {
            item.doc.title += '123'
            db.put(item.doc)
          }}>edit</button>
        <button onClick={() => db.remove(item.doc)}>delete</button></li>)}
    </ul>
  </div>
}