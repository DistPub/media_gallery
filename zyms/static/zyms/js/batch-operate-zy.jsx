import styles from '../css/batch-operate-zy.cssm' assert { type: 'css' };
import {ShellContext, PouchDBContext, ModalContainer, ConstsContext} from "./context.js";
import {ProgressBar} from "./components.jsx";
import { XLSX } from "https://cdn.jsdelivr.net/npm/dshell@1.4.0/dep.js";

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

function makeFlow(shell) {
  return shell.Action
    .buildExcel(['data', ["platform", "name", "id", "category", "follow_number", "activate", "accounting_period", "pay_category", "vendor", "vendor_account"], []])
    .download(['demo.xlsx'])
}

function makeDownloadErrorFlow(shell, name, errors) {
  return shell.Action
    .cBuildExcel(['error', Object.keys(errors[0]), errors])
    .download([`${name}_error.xlsx`])
}

async function process_wb(wb, db, setTotal, setComplete, setError) {
  let rows = XLSX.utils.sheet_to_json(wb.Sheets['data'], {raw:false})

  if (!rows.length) {
    return;
  }

  setTotal(rows.length);
  setComplete(0);
  setError([]);

  let cache = {};

  let response = await db.bulkDocs(rows.map(item=>{
    let _id = `data/${item.platform}/${item.name}`
    cache[_id] = {...item}
    item._id = _id
    return item
  }))

  response.map(item => {
    if (item.ok) {
      setComplete(old => old + 1);
    }

    if (item.error) {
      setError(old => old.concat([cache[item.id]]));
    }
  })
}

export default function BatchOperateZY(props) {
  const db = React.useContext(PouchDBContext);
  const shell = React.useContext(ShellContext);
  const modalContainer = React.useContext(ModalContainer)
  const Consts = React.useContext(ConstsContext)

  const [total, setTotal] = React.useState(0)
  const [complete, setComplete] = React.useState(0)
  const [display, setDisplay] = React.useState(false)
  const [error, setError] = React.useState([])
  const [fileName, setFileName] = React.useState(null);
  const [file, setFile] = React.useState(null);

  React.useEffect(()=>{
    shell.installExternalAction(CBuildExcel)
  }, [])

  function batchUpload() {
    var reader = new FileReader();
    reader.onload = function (e) {
      setDisplay(true);

      var data = e.target.result;
      var readtype = {type: 'binary'};
      let wb = XLSX.read(data, readtype);
      process_wb(wb, db, setTotal, setComplete, setError);
    };
    reader.readAsBinaryString(file);
  }

  return <div id={styles.wrapper}>
    <div className="ui segment form">
      <h3 className="ui header">批量上传<a className={`${styles['download-demo-file']} ui teal tag label`} onClick={() => {
        let flow = makeFlow(shell);
        shell.exec(flow);
      }}>下载模板文件</a></h3>
      <div className={`${styles['flex-middle-aligned']} fields`}>
        <div className="inline field">
          <label htmlFor="file" className={`${styles['file-input']} ui icon button`}>
            <i className="file icon"></i>
            选择上传文件</label>
          <input type="file" id="file" onChange={
            (event) => {
              if (!event.target.files.length) {
                return;
              }
              setFileName(event.target.files[0].name);
              setFile(event.target.files[0]);
            }
          } className={styles.hidden}/>
        {fileName && <span className={`ui left pointing label`}>{fileName}</span>}
        </div>
        <div className="ui field download primary button" onClick={batchUpload}>
          开始上传
        </div>
      </div>
      <ProgressBar display={display} total={total} complete={complete}/>
      {error.length>0 && <div className="ui red message">
        <p>数据上传完成，有数据在库中已存在：<a href='#' onClick={()=>{
          let flow = makeDownloadErrorFlow(shell, fileName, error)
          shell.exec(flow);
        }}>下载重复数据列表</a></p>
      </div>}
    </div>
    <div className="ui segment form">
      <h3 className="ui header">批量导出</h3>
    </div>
  </div>
}