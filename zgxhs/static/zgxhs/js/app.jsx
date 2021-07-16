import ManualBooks from "./manual-books.jsx";
import CreateTask from "./create-task.jsx";
import TaskTable from "./task-table.jsx";

export default function App(props) {
  return <>
    <div className="ui divider"/>
    <ManualBooks/>
    <div className="ui divider"/>
    <CreateTask/>
    <div className="ui divider"/>
    <TaskTable/>
  </>
}