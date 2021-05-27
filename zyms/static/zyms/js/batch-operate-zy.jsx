import styles from '../css/batch-operate-zy.cssm' assert { type: 'css' };
import {ShellContext, PouchDBContext, ModalContainer, ConstsContext} from "./context.js";
import {ModalDialog, ProgressBar,ResetButton, SubmitButton, TextArea} from "./components.jsx";
import { XLSX } from "https://cdn.jsdelivr.net/npm/dshell@1.4.0/dep.js";

const dataTypes = {
  name: '账号名称',
  id:'ID/链接'
}

const tmp = {
  "platform": 'N/A',
  "name": "N/A",
  "id": 'N/A',
  "category": "N/A",
  "follow_number": 'N/A',
  "activate": "N/A",
  "accounting_period": "N/A",
  "pay_category": "N/A",
  "vendor": "N/A",
  "vendor_account": 'N/A'
}

async function CBuildExcel(_, sheetName, header, rows) {
  const workbook = XLSX.utils.book_new()
  if (!header) {
    header = Object.keys(rows[0])
  }
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

function makeExportFlow(shell, names, dataType, platform) {
  return shell.Action
    .map([names])
    .fetchDoc([dataType, platform])
    .Collect
    .cBuildExcel(['data', undefined])
    .download(['export_data.xlsx'])
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
  const [fileError, setFileError] = React.useState(null);

  const [dataType, setDataType] = React.useState('name');
  const [platformFilter, setPlatformFilter] = React.useState(Consts.platform[0])
  const [resource, setResource] = React.useState('');
  const [totala, setTotala] = React.useState(0)
  const [completea, setCompletea] = React.useState(0)
  const [displaya, setDisplaya] = React.useState(false)
  const [resourceError, setResourceError] = React.useState(false)

  async function process_wb(wb) {
    let rows = XLSX.utils.sheet_to_json(wb.Sheets['data'], {raw:false})

    if (!rows.length) {
      setFileError('上传的文件没有包含任何数据！')
      return;
    }

    if (JSON.stringify(Object.keys(rows[0]).sort()) !== JSON.stringify(Object.keys(tmp).sort())) {
      setFileError('上传的文件头不对，请参考模板文件！')
      return;
    }

    setDisplay(true)
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

  async function FetchDoc(_, type, platform, name) {
    setCompletea(old=>old+1)

    if (type === 'name') {
      let doc;
      try {
        doc = await db.get(`data/${platform}/${name}`)
      } catch(error) {
        return {...tmp, id: name, platform};
      }
      delete doc._id
      delete doc._rev
      return doc
    }

    let response = await db.find({
      selector: {
        id: name,
        platform: platform,
      },
      limit: 1,
    })

    if (response.docs.length) {
      let doc = response.docs[0]
      delete doc._id
      delete doc._rev
      return doc
    }

    return tmp;
  }

  React.useEffect(()=>{
    shell.installExternalAction(CBuildExcel)
    shell.installExternalAction(FetchDoc)
  }, [])

  function batchUpload() {
    var reader = new FileReader();
    reader.onload = function (e) {
      var data = e.target.result;
      var readtype = {type: 'binary'};
      let wb = XLSX.read(data, readtype);
      process_wb(wb);
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
      <div className='fields'>
        <div className='inline field'>
        <label>数据类型</label>
        <select value={dataType} onChange={event=>setDataType(event.target.value)}>
          {Object.keys(dataTypes).map(item=><option key={item} value={item}>{dataTypes[item]}</option>)}
        </select>
        </div>

        <div className='inline field'>
        <label>平台</label>
        <select value={platformFilter} onChange={event=>setPlatformFilter(event.target.value)}>
          {Consts.platform.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
        </div>

      </div>
      <div className='field'><TextArea value={resource} onChange={(event)=>setResource(event.target.value)}/>
      </div>
        <ProgressBar display={displaya} total={totala} complete={completea}/>
      <div className='fields'><div className='field'>
        <SubmitButton onClick={()=>{
          const names = resource.split('\n').filter(item => item.length > 0)
        if (!names.length) {
          return setResourceError(true)
        }

        setTotala(names.length)
        setDisplaya(true)

        let flow = makeExportFlow(shell, names, dataType, platformFilter)
          shell.exec(flow)
        }}>导出</SubmitButton></div><div className='field'>
      <ResetButton onClick={()=>{
        setResource('')
        setDisplaya(false)
        setDataType('name')
        setPlatformFilter(Consts.platform[0])
      }}/></div>
      </div>
    </div>
    { resourceError && <ModalDialog title={'错误'} body={`请输入至少一个${dataTypes[dataType]}！`} container={modalContainer} onClose={
        ()=>setResourceError(false)
      }/>}
    { fileError && <ModalDialog title={'错误'} body={fileError} container={modalContainer} onClose={
      ()=>setFileError(null)
    }/>}
  </div>
}