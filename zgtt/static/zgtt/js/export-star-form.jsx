import {
  ProgressBar,
  LoadingMessage,
  CheckBox, Header,
  ResetButton,
  SubmitButton,
  TextArea,
  ModalDialog
} from "./components.jsx"
import {ShellContext, ModalContainer} from './context.js'

function BuildAPI(_, name) {
  let api = new URL(atob('aHR0cHM6Ly9zdGFyLnRvdXRpYW8uY29tL3YvYXBpL2RlbWFuZC9hdXRob3JfbGlzdC8='))
  api.searchParams.append('limit', 20)
  api.searchParams.append('need_detail', true)
  api.searchParams.append('page', 1)
  api.searchParams.append('platform_source', 1)
  api.searchParams.append('key', name)
  api.searchParams.append('task_category', 1)
  api.searchParams.append('order_by', 'score')
  api.searchParams.append('disable_replace_keyword', false)
  api.searchParams.append('is_filter', false)
  return api
}

async function GetInfo({exec}, data) {
  let [name, response] = data
  let authors = response.data.authors.filter(item => item.nick_name === name)

    let multiple = 0
    let author = null
    let real = 'N/A'
    let fensi = 'N/A'
    let id = 'N/A'
    let yuedu = 'N/A'
    let dianzan = 'N/A'
    let huoyue = 'N/A'
    let zhishu = 'N/A'

    if (authors.length === 0) {
      multiple = -1
      return [name, multiple, id, fensi, yuedu, dianzan, huoyue, zhishu]
    }
  await exec(this.Action.RiseTotal)
  await exec(this.Action.RiseTotal)
  await exec(this.Action.RiseTotal)

    if (authors.length > 1) {
      multiple = 1
    }

    ;({id: real, short_id: id, follower: fensi, expected_play_num: yuedu} = authors[0])

    let api = new URL(atob('aHR0cHM6Ly9zdGFyLnRvdXRpYW8uY29tL2gvYXBpL2dhdGV3YXkvaGFuZGxlcl9nZXQv'))
      api.searchParams.append('o_author_id', real)
      api.searchParams.append('platform_source', 1)
      api.searchParams.append('platform_channel', 1)
      api.searchParams.append('limit', 15)
      api.searchParams.append('service_name', 'author.AdStarAuthorService')
      api.searchParams.append('service_method', 'GetAuthorLatestItems')

      let paramsString = `limit15o_author_id${real}platform_channel1platform_source1service_methodGetAuthorLatestItemsservice_nameauthor.AdStarAuthorService`
      paramsString = paramsString + 'e39539b8836fb99e1538974d3ac1fe98'
      api.searchParams.append('sign', md5(paramsString))

    response = await fetch(api, {mode: 'cors', credentials: 'include'})
    response = await response.json()
        await exec(this.Action.RiseCompleteProgress)

    ;({min_like: dianzan} = response.data.description)


    api = new URL(atob('aHR0cHM6Ly9zdGFyLnRvdXRpYW8uY29tL2gvYXBpL2dhdGV3YXkvaGFuZGxlcl9nZXQv'))
      api.searchParams.append('o_author_id', real)
      api.searchParams.append('platform_source', 1)
      api.searchParams.append('author_type', 1)
      api.searchParams.append('service_name', 'data.AdStarDataService')
      api.searchParams.append('service_method', 'GetAuthorFansDistributionV2')

      paramsString = `author_type1o_author_id${real}platform_source1service_methodGetAuthorFansDistributionV2service_namedata.AdStarDataService`
      paramsString = paramsString + 'e39539b8836fb99e1538974d3ac1fe98'
      api.searchParams.append('sign', md5(paramsString))

    response = await fetch(api, {mode: 'cors', credentials: 'include'})
    response = await response.json()
          await exec(this.Action.RiseCompleteProgress)

    let distribution = response.data.distributions.filter(item => item.type_display === '活跃度分布')[0]
    huoyue = distribution.description.slice('活跃粉丝占比'.length)


    api = new URL(atob('aHR0cHM6Ly9zdGFyLnRvdXRpYW8uY29tL2gvYXBpL2dhdGV3YXkvaGFuZGxlcl9nZXQv'))
      api.searchParams.append('o_author_id', real)
      api.searchParams.append('platform_source', 1)
      api.searchParams.append('platform_channel', 1)
      api.searchParams.append('service_name', 'author.AdStarAuthorService')
      api.searchParams.append('service_method', 'AuthorScoreV2')

      paramsString = `o_author_id${real}platform_channel1platform_source1service_methodAuthorScoreV2service_nameauthor.AdStarAuthorService`
      paramsString = paramsString + 'e39539b8836fb99e1538974d3ac1fe98'
      api.searchParams.append('sign', md5(paramsString))

    response = await fetch(api, {mode: 'cors', credentials: 'include'})
    response = await response.json()
          await exec(this.Action.RiseCompleteProgress)

    zhishu = response.data.top_score
    return [name, multiple, id, fensi, yuedu, dianzan, huoyue, zhishu]
}


async function CTextFetch({exec}, api, { cors=true, bodyEncoder=null, headers={}, ...options }={}, body=undefined) {
  if (bodyEncoder === 'form') {
    const data = new URLSearchParams()
    for (const [key, value] of Object.entries(body)) {
      data.append(key, value)
    }
    options.body = data
  } else if (bodyEncoder === 'json') {
    options.body = JSON.stringify(body)
    headers['content-type'] = 'application/json'
  }
  if (cors) {
    options.mode = 'cors'
    options.credentials = "include"
  }
  const response = await window.fetch(api, {headers, ...options})
      await exec(this.Action.RiseCompleteProgress)

  return await response.json()
}

function makeFlow(shell, names, checked, CallbackName) {
  let action = shell.Action
    .map([names]) // name
    .BuildAPI // api
    .CTextFetch // data
    .Collect // [data, data, ...]
    .zipArray([names]) // [[name, data], ...]
    .Map.GetInfo.Collect // [[name, multiple, id, fensi, yuedu, dianzan, huoyue, zhishu], ...]
    .buildExcel(['data', ['name', 'multiple', 'id', 'fensi', 'yuedu', 'dianzan', 'huoyue', 'zhishu']])
    .download(['info.xlsx'])

  if (checked) {
    action = action.pushFile(['/tmp/info.xlsx']).PreviewOffice
  }
  return action
}

export default function ExportFensiForm(props) {
  const shell = React.useContext(ShellContext)
  const modalContainer = React.useContext(ModalContainer)
  const [loading, setLoading] = React.useState(true)
  const [display, setDisplay] = React.useState(false)
  const [total, setTotal] = React.useState(0)
  const [complete, setComplete] = React.useState(0)
  const [checked, setChecked] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [resource, setResource] = React.useState('')
  const [riseCompleteCallbackName, setRiseCompleteCallbackName] = React.useState('RiseCompleteProgress')

  function RiseCompleteProgress(_) {
    setComplete(old => old + 1)
  }

  function RiseTotal(_) {
    setTotal(old => old + 1)
  }

  React.useEffect(async () => {
    if (!shell) {
      return
    }

    shell.installExternalAction(BuildAPI)
    shell.installExternalAction(GetInfo)
    shell.installExternalAction(CTextFetch)
    shell.installExternalAction(RiseCompleteProgress)
    shell.installExternalAction(RiseTotal)

    setLoading(false)
  }, [shell])

  let view = null

  if (loading) {
    view = <LoadingMessage title={'请稍等'}>导出功能加载中...</LoadingMessage>
  } else {
    view = <div className="ui form">
      <div className="field">
        <TextArea value={resource} onChange={(event)=>setResource(event.target.value)}/>
      </div>
      <div className="inline fields">
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
          return setError(true)
        }

        setComplete(0)
        setTotal(names.length)
        setDisplay(true)

        const response = await shell.exec(makeFlow(shell, names, checked, riseCompleteCallbackName))
        console.log(response.json())
      }}>导出</SubmitButton>
      <ResetButton onClick={()=>{
        setResource('')
        setChecked(false)
        setDisplay(false)
      }}/>
      { error && <ModalDialog title={'错误'} body={'请输入至少一个用户名称！'} container={modalContainer} onClose={
        ()=>setError(false)
      }/>}
    </div>
  }

  return <>
    <Header title={'信息导出'} subTitle={'请在文本框中用户名称，每行一个'}/>
    { view }
  </>
}