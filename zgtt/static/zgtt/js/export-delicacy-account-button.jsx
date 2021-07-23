import {Header, LoadingMessage, ProgressBar, ExportButton} from "./components.jsx";
import {ShellContext} from "./context.js";

function makeFlow(shell) {
  return shell.Action
    .QueryAccount // [id, info]
    .AccountDetail // info
    .Collect // => [row, ...]
    .buildExcel(['data',
      ["账号名", "账号ID", "星图20秒价格", "星图60秒价格", "粉丝量", "20S cpm", "60S cpm", "简介", "完播率", "星图指数"]
    ])
    .download(['accounts.xlsx'])
}

export default function ExportDelicacyAccountButton() {
  const shell = React.useContext(ShellContext)
  const [loading, setLoading] = React.useState(true)
  const [total, setTotal] = React.useState(0)
  const [complete, setComplete] = React.useState(0)


async function* QueryAccount(di, page=1) {
  setTotal(old => old + 1)

  let response = await fetch(
    atob("aHR0cHM6Ly93d3cueGluZ3R1LmNuL3YvYXBpL2RlbWFuZC9hdXRob3JfbGlzdC8/bGltaXQ9MzAmbmVlZF9kZXRhaWw9dHJ1ZSZwbGF0Zm9ybV9zb3VyY2U9MSZ0YXNrX2NhdGVnb3J5PTEmdGFnPTQ4Jm9yZGVyX2J5PXNjb3JlJmRpc2FibGVfcmVwbGFjZV9rZXl3b3JkPWZhbHNlJmV4cGVjdGVkX2NwbV9fbGU9MjAmbWFya2V0aW5nX3RhcmdldD0xJmlzX2ZpbHRlcj10cnVl")+`&page=${page}`,
    {mode: 'cors', credentials: 'include'})
  let data = await response.json()

  setTotal(old => old + data.data.authors.length*3)

  for (let item of data.data.authors) {
    yield [item.id, [item.nick_name, item.short_id, item.price_info[0].price, item.price_info[1].price, item.follower]]
  }

  if (data.data.pagination.has_more) {
    yield* QueryAccount.apply(this, [di, page+1])
  }

  setComplete(old => old + 1)
}

async function AccountDetail(di, args) {
  let [id, info] = args;
  let api = new URL(atob("aHR0cHM6Ly93d3cueGluZ3R1LmNuL2gvYXBpL2dhdGV3YXkvaGFuZGxlcl9nZXQv"))
  api.searchParams.append('o_author_id', id)
  api.searchParams.append('platform_source', 1)
  api.searchParams.append('platform_channel', 1)
  api.searchParams.append('service_name', 'author.AdStarAuthorService')
  api.searchParams.append('service_method', 'GetAuthorPlatformChannelInfoV2')

  let paramsString = `o_author_id${id}platform_channel1platform_source1service_methodGetAuthorPlatformChannelInfoV2service_nameauthor.AdStarAuthorService`
  paramsString = paramsString + 'e39539b8836fb99e1538974d3ac1fe98'
  api.searchParams.append('sign', md5(paramsString))

  let response = await fetch(api, {mode: 'cors', credentials: 'include'})
  response = await response.json()
  let intro = response.data.self_intro;
  setComplete(old => old + 1)

  api = new URL(atob("aHR0cHM6Ly93d3cueGluZ3R1LmNuL2gvYXBpL2dhdGV3YXkvaGFuZGxlcl9nZXQv"))
  api.searchParams.append('o_author_id', id)
  api.searchParams.append('platform_source', 1)
  api.searchParams.append('platform_channel', 1)
  api.searchParams.append('service_name', 'author.AdStarAuthorService')
  api.searchParams.append('service_method', 'AuthorScoreV2')

  paramsString = `o_author_id${id}platform_channel1platform_source1service_methodAuthorScoreV2service_nameauthor.AdStarAuthorService`
  paramsString = paramsString + 'e39539b8836fb99e1538974d3ac1fe98'
  api.searchParams.append('sign', md5(paramsString))

  response = await fetch(api, {mode: 'cors', credentials: 'include'})
  response = await response.json()
  let score = response.data.top_score
  setComplete(old => old + 1)

  api = new URL(atob("aHR0cHM6Ly93d3cueGluZ3R1LmNuL2gvYXBpL2dhdGV3YXkvaGFuZGxlcl9nZXQv"))
  api.searchParams.append('o_author_id', id)
  api.searchParams.append('platform_source', 1)
  api.searchParams.append('platform_channel', 1)
  api.searchParams.append('type', 2)
  api.searchParams.append('range', 2)
  api.searchParams.append('service_name', 'data.AdStarDataService')
  api.searchParams.append('service_method', 'GetAuthorSpreadInfo')

  paramsString = `o_author_id${id}platform_channel1platform_source1range2service_methodGetAuthorSpreadInfoservice_namedata.AdStarDataServicetype2`
  paramsString = paramsString + 'e39539b8836fb99e1538974d3ac1fe98'
  api.searchParams.append('sign', md5(paramsString))

  response = await fetch(api, {mode: 'cors', credentials: 'include'})
  response = await response.json()
  let playOverRate = response.data.play_over_rate.value
  let {cpm_1_20:cpm20, cpm_21_60:cpm60} = response.data.expect_cpm
  setComplete(old => old + 1)
  return [...info, cpm20, cpm60, intro, playOverRate, score]
}


  React.useEffect(async () => {
    if (!shell) {
      return
    }
    shell.installExternalAction(QueryAccount)
    shell.installExternalAction(AccountDetail)

    setLoading(false)
  }, [shell])
  const [display, setDisplay] = React.useState(false)

  let view = null

  if (loading) {
    view = <LoadingMessage title={'请稍等'}>导出功能加载中...</LoadingMessage>
  } else {
    view = <>
      <ProgressBar display={display} total={total} complete={complete}/>
      <ExportButton onClick={async () => {
        setComplete(0)
        setTotal(0)
        setDisplay(true)

        const response = await shell.exec(makeFlow(shell))
        console.log(response.json())
      }}>{"导出美食+cpm<20"}</ExportButton>
    </>
  }

  return <><Header title={'批量导出'} subTitle={'请登录相关账号'}/>
  { view }
  </>
}