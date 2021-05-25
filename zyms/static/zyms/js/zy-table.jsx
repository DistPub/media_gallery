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

    db.changes({
      since: 'now',
      live: true
    }).on('change', showTodos);
  }, [])

  return <>
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
  </>
}