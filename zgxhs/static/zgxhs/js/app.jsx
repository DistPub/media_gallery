import ManualBooks from "./manual-books.jsx";
import CreateTask from "./create-task.jsx";
import TaskTable from "./task-table.jsx";
import BookMarks from "./book-marks.jsx";

export default function App(props) {
  return <>
    <div className="ui divider"/>
    <BookMarks/>
    <div className="ui divider"/>
    <ManualBooks/>
    <div className="ui divider"/>
    <CreateTask/>
    <div className="ui divider"/>
    <TaskTable/>
  </>
}