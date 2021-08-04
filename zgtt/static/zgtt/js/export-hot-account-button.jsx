import {LoadingMessage, ProgressBar, ExportButton} from "./components.jsx";
import {ShellContext} from "./context.js";

function makeFlow(shell, hotID, namespace) {
  return shell.Action.using(namespace)
    .hotAccount([hotID]) // [id, info]
    .HotAccountDetail.using(null) // info
    .Collect // => [row, ...]
    .buildExcel(['data',
      ["账号名", "粉丝量", "账号ID", "星图20秒价格", "星图60秒价格", "20S cpm", "60S cpm", "简介", "完播率", "星图指数"]
    ])
    .download(['accounts.xlsx'])
}

export default function ExportHotAccountButton(props) {
  const shell = React.useContext(ShellContext)
  const [loading, setLoading] = React.useState(true)
  const [total, setTotal] = React.useState(0)
  const [complete, setComplete] = React.useState(0)


async function* HotAccount(di, hotID) {
  setTotal(old => old + 1)

  let api = new URL(atob("aHR0cHM6Ly93d3cueGluZ3R1LmNuL2gvYXBpL2dhdGV3YXkvaGFuZGxlcl9nZXQv"))
  api.searchParams.append('hot_list_id', hotID)
  api.searchParams.append('tag', "")
  api.searchParams.append('service_name', 'author.AdStarAuthorService')
  api.searchParams.append('service_method', 'GetHotListData')

  let paramsString = `hot_list_id${hotID}service_methodGetHotListDataservice_nameauthor.AdStarAuthorServicetag`
  paramsString = paramsString + 'e39539b8836fb99e1538974d3ac1fe98'
  api.searchParams.append('sign', md5(paramsString))

  let response = await fetch(api, {mode: 'cors', credentials: 'include'})
  response = await response.json()

  setTotal(old => old + response.data.stars.length*5)

  for (let item of response.data.stars) {
    yield [item.id, [item.nick_name]]
  }

  setComplete(old => old + 1)
}

async function HotAccountDetail(di, args) {
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
  let intro = response.data?.self_intro;
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
  api.searchParams.append('service_name', 'author.AdStarAuthorService')
  api.searchParams.append('service_method', 'GetAuthorMarketingInfo')

  paramsString = `o_author_id${id}platform_channel1platform_source1service_methodGetAuthorMarketingInfoservice_nameauthor.AdStarAuthorService`
  paramsString = paramsString + 'e39539b8836fb99e1538974d3ac1fe98'
  api.searchParams.append('sign', md5(paramsString))

  response = await fetch(api, {mode: 'cors', credentials: 'include'})
  response = await response.json()
  let price20 = response.data.price_info[0]?.price
  let price60 = response.data.price_info[1]?.price
  setComplete(old => old + 1)

    api = new URL(atob("aHR0cHM6Ly93d3cueGluZ3R1LmNuL2gvYXBpL2dhdGV3YXkvaGFuZGxlcl9nZXQv"))
  api.searchParams.append('o_author_id', id)
  api.searchParams.append('platform_source', 1)
  api.searchParams.append('platform_channel', 1)
  api.searchParams.append('recommend', true)
  api.searchParams.append('service_name', 'author.AdStarAuthorService')
  api.searchParams.append('service_method', 'GetAuthorBaseInfo')

  paramsString = `o_author_id${id}platform_channel1platform_source1recommendrecommendservice_methodGetAuthorBaseInfoservice_nameauthor.AdStarAuthorService`
  paramsString = paramsString + 'e39539b8836fb99e1538974d3ac1fe98'
  api.searchParams.append('sign', md5(paramsString))

  response = await fetch(api, {mode: 'cors', credentials: 'include'})
  response = await response.json()
  let short_id = response.data.short_id
    let follower = response.data.follower
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
  return [...info, follower, short_id, price20, price60, cpm20, cpm60, intro, playOverRate, score]
}


  React.useEffect(async () => {
    if (!shell) {
      return
    }
    shell.installExternalAction(HotAccount, props.name)
    shell.installExternalAction(HotAccountDetail, props.name)

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

        const response = await shell.exec(makeFlow(shell, props.hotID, props.name))
        console.log(response.json())
      }}>{props.name}</ExportButton>
    </>
  }

  return <>
  { view }
  </>
}