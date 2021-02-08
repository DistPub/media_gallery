import {
  ProgressBar,
  LoadingMessage,
  CheckBox, Header,
  ResetButton,
  SelectOne,
  SubmitButton,
  TextArea
} from "./components.jsx"
import {InitedShellContext, ShellContext} from './context.js'
import {generateID} from './utils.js'


const brandOptions = ["微信", "微博", "美拍", "秒拍", "花椒", "微博直播", "快手直播", "一直播", "映客", "抖音直播", "其它",
  "B站", "抖音", "快手", "小红书", "传统媒体", "知乎", "今日头条", "微信群", "微信朋友圈", "QQ空间"]

function BuildFetchPayload(_, type, name) {
  return {
    SearchTableName: 'Search/PRT_Product',
    ProjectName: name,
    Supply: '',
    MaxCost: '',
    Fans: '',
    Tag: '',
    Place: '',
    Position: '',
    ProductBrand: type,
    Order: ''
  }
}

function makeFlow(shell, names, brand, checked, CallbackName) {
  const api = atob('aHR0cDovL3dvcmsudmlnbGxlLmNvbS9CYXNlVGFibGUvTGlzdA==')
  let action = shell.Action
    .zipArray([Array(names.length).fill(brand), names]) // => [[brand, name], ...]
    .BuildFetchPayload.PCollect // => [payload, ...]
    .textFetch([api, { cors: true, bodyEncoder: 'form', method: 'POST'}])
    .pCollect({callback: {action: `/${CallbackName}`}}) // => [html, ...]
    .Map.selectText([{ selector: 'div.col-sm-2 > div:nth-child(4)', killImg: true }]).Collect // => [vendor, ...]
    .zipArray([names])
    .buildExcel(['data', ['name', 'vendor']])
    .download(['vendor.xlsx'])

  if (checked) {
    action = action.pushFile(['/tmp/vendor.xlsx']).PreviewOffice
  }
  return action
}

export default function ExportVendorForm(props) {
  const inited = React.useContext(InitedShellContext)
  const shell = React.useContext(ShellContext)
  const [loading, setLoading] = React.useState(true)
  const [display, setDisplay] = React.useState(false)
  const [total, setTotal] = React.useState(0)
  const [complete, setComplete] = React.useState(0)
  const [checked, setChecked] = React.useState(false)
  const [resource, setResource] = React.useState('')
  const [brand, setBrand] = React.useState(brandOptions[0])
  const [riseCompleteCallbackName, setRiseCompleteCallbackName] = React.useState('RiseCompleteProgress')

  function RiseCompleteProgress(_, action) {
    console.log(`${action.action} done +1`)
    setComplete(old => old + 1)
  }

  React.useEffect(async () => {
    if (!inited) {
      return
    }

    shell.installExternalAction(BuildFetchPayload)
    let value = generateID('RiseCompleteProgress')
    Object.defineProperty(RiseCompleteProgress, 'name', { value })
    setRiseCompleteCallbackName(value)
    shell.installExternalAction(RiseCompleteProgress)

    setLoading(false)
  }, [inited])

  let view = null

  if (loading) {
    view = <LoadingMessage title={'请稍等'}>供应商导出功能加载中...</LoadingMessage>
  } else {
    view = <div className="ui form">
      <div className="field">
        <TextArea value={resource} onChange={(event)=>setResource(event.target.value)}/>
      </div>
      <div className="inline fields">
        <div className="field">
          <SelectOne name={'brand'} label={'资源品牌'} options={brandOptions} value={brand}
                     onChange={(event)=>setBrand(event.target.value)}/>
        </div>
        <div className="field">
          <CheckBox name={'preview'} label={'在线预览导出文件'} checked={checked}
                    onChange={() => setChecked(old => !old)}
                    onClick={() => setChecked(old => !old)}/>
        </div>
      </div>
      <ProgressBar display={display} total={total} complete={complete}/>
      <SubmitButton onClick={async ()=>{
        const names = resource.split('\n').filter(item => item.length > 0)
        if (!names.length) {
          return showModal('Empty Inpute', 'You must input one item at least!')
        }

        setComplete(0)
        setTotal(names.length)
        setDisplay(true)

        const response = await shell.exec(makeFlow(shell, names, brand, checked, riseCompleteCallbackName))
        console.log(response.json())
      }}>导出</SubmitButton>
      <ResetButton onClick={()=>{
        setResource('')
        setChecked(false)
        setBrand(brandOptions[0])
        setDisplay(false)
      }}/>
    </div>
  }

  return <>
    <Header title={'供应商导出'} subTitle={'请在文本框中输入资源项目名称，每行一个'}/>
    { view }
  </>
}