import dshell from 'https://cdn.jsdelivr.net/npm/dshell@1.4.0/dshell.js'
import {ShellContext} from "./context.js"

var db = new PouchDB('todos');

let username = sessionStorage.getItem('username');

if (!username) {
    username = prompt("请输入用户名", "<username>");
    sessionStorage.setItem('username', username);
}

let password = sessionStorage.getItem('password');

if (!password) {
    password = prompt("请输入密码", "<password>");
    sessionStorage.setItem('password', password);
}

var remoteCouch = `https://${username}:${password}@relax.smitechow.com/todos`;
var opts = {live: true};
db.replicate.to(remoteCouch, opts, console.log);
db.replicate.from(remoteCouch, opts, console.log);

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

export default function App(props) {
  const [shell, setShell] = React.useState(null);
  const [todos, setTodos] = React.useState([]);
  const [title, setTitle] = React.useState('');

  function showTodos() {
    db.allDocs({include_docs: true, descending: true}, function(err, doc) {
      setTodos(doc.rows);
    });
  }

  db.changes({
    since: 'now',
    live: true
  }).on('change', showTodos);

  React.useEffect(async () => {
    await dshell.init()
    setShell(dshell);

    showTodos();
  }, [])

  return <ShellContext.Provider value={shell}>
    <input onChange={(event)=>setTitle(event.target.value)}></input>
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
  </ShellContext.Provider>
}