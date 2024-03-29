import {LoadingMessage, ProgressBar, ExportButton} from "./components.jsx";
import {ShellContext} from "./context.js";
import {sleep} from './utils.js';

function makeFlow(shell, hotID, namespace) {
  return shell.Action.using(namespace)
    .hotAccount([hotID]) // [id, info]
    .HotAccountDetail.using(null) // info
    .Collect // => [row, ...]
    .buildExcel(['data',
      ["账号名", "粉丝量", "账号ID", "星图20秒价格", "星图60秒价格", "20S cpm", "60S cpm", "简介", "星图视频完播率",
        "星图视频互动率","星图视频latest15播放量","星图视频latest15点赞量",
        "星图指数", "MCN",
      "标签", "地区", "观众男性占比", "观众女性占比", "观众地域占比（top10）",
        "粉丝男性占比", "粉丝女性占比", "粉丝地域占比（top10）","粉丝活跃度"]
    ])
    .download(['accounts.xlsx'])
}

export default function ExportHotAccountButton(props) {
  const shell = React.useContext(ShellContext)
  const [loading, setLoading] = React.useState(true)
  const [total, setTotal] = React.useState(0)
  const [complete, setComplete] = React.useState(0)

async function* HotAccount(di, hotID) {
    let tags;
    let cache=[];
    let called = [];

    if (hotID==='6766936376500813837'){
      tags=["", "颜值达人", "剧情搞笑", "美妆", "时尚", "萌宠", "音乐", "美食", "游戏", "旅行", "汽车", "生活", "测评", "二次元",
        "母婴亲子", "科技数码", "运动健身", "家居家装", "影视娱乐", "财经投资", "情感", "三农"]
    }else{
      tags=['']
    }
    async function* inner(tag) {
      setTotal(old => old + 1)

      let api = new URL(atob("aHR0cHM6Ly93d3cueGluZ3R1LmNuL2gvYXBpL2dhdGV3YXkvaGFuZGxlcl9nZXQv"))
      api.searchParams.append('hot_list_id', hotID)
      api.searchParams.append('tag', tag)
      api.searchParams.append('service_name', 'author.AdStarAuthorService')
      api.searchParams.append('service_method', 'GetHotListData')

      let paramsString = `hot_list_id${hotID}service_methodGetHotListDataservice_nameauthor.AdStarAuthorServicetag${tag}`
      paramsString = paramsString + 'e39539b8836fb99e1538974d3ac1fe98'
      api.searchParams.append('sign', md5(paramsString))

      let response = await fetch(api, {mode: 'cors', credentials: 'include'})
      response = await response.json()

      let callTimes = 8;

      setTotal(old => old + response.data.stars.length * callTimes)

      for (let item of response.data.stars) {
        if (cache.includes(item.id)){
          setTotal(old => old - callTimes)
          continue;
        } else {
          cache.push(item.id);
        }

        called.push((new Date).getTime());
        yield [item.id, [item.nick_name]]

        do {
          let nowT = (new Date()).getTime() - (60*1000);
          called = called.filter(item=>item>=nowT);

          // reach the limit
          if (called.length>=10) {
            console.log(`too fast, sleep...`)
            await sleep(1000);
          } else {
            console.log(`resume...`)
            break;
          }

        } while (1)
      }

      setComplete(old => old + 1)
    }
    for (let item of tags) {
      yield* inner(item);
    }
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
  let fetch1 = await fetch(api, {mode: 'cors', credentials: 'include'});

  api = new URL(atob("aHR0cHM6Ly93d3cueGluZ3R1LmNuL2gvYXBpL2dhdGV3YXkvaGFuZGxlcl9nZXQv"))
  api.searchParams.append('o_author_id', id)
  api.searchParams.append('platform_source', 1)
  api.searchParams.append('platform_channel', 1)
  api.searchParams.append('service_name', 'author.AdStarAuthorService')
  api.searchParams.append('service_method', 'AuthorScoreV2')

  paramsString = `o_author_id${id}platform_channel1platform_source1service_methodAuthorScoreV2service_nameauthor.AdStarAuthorService`
  paramsString = paramsString + 'e39539b8836fb99e1538974d3ac1fe98'
  api.searchParams.append('sign', md5(paramsString))
  let fetch2 = await fetch(api, {mode: 'cors', credentials: 'include'});

  api = new URL(atob("aHR0cHM6Ly93d3cueGluZ3R1LmNuL2gvYXBpL2dhdGV3YXkvaGFuZGxlcl9nZXQv"))
  api.searchParams.append('o_author_id', id)
  api.searchParams.append('platform_source', 1)
  api.searchParams.append('platform_channel', 1)
  api.searchParams.append('service_name', 'author.AdStarAuthorService')
  api.searchParams.append('service_method', 'GetAuthorMarketingInfo')

  paramsString = `o_author_id${id}platform_channel1platform_source1service_methodGetAuthorMarketingInfoservice_nameauthor.AdStarAuthorService`
  paramsString = paramsString + 'e39539b8836fb99e1538974d3ac1fe98'
  api.searchParams.append('sign', md5(paramsString))
  let fetch3 = await fetch(api, {mode: 'cors', credentials: 'include'});

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
  let fetch4 = await fetch(api, {mode: 'cors', credentials: 'include'})

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
  let fetch5 = await fetch(api, {mode: 'cors', credentials: 'include'})

  api = new URL(atob("aHR0cHM6Ly93d3cueGluZ3R1LmNuL2gvYXBpL2dhdGV3YXkvaGFuZGxlcl9nZXQv"))
  api.searchParams.append('o_author_id', id)
  api.searchParams.append('platform_source', 1)
  api.searchParams.append('platform_channel', 1)
  api.searchParams.append('type', 1)
  api.searchParams.append('sign_strict', 1)
  api.searchParams.append('service_name', 'data.AdStarDataService')
  api.searchParams.append('service_method', 'GetAuthorWatchedDistribution')

  paramsString = `o_author_id${id}platform_channel1platform_source1service_methodGetAuthorWatchedDistributionservice_namedata.AdStarDataServicesign_strict1type1`
  paramsString = paramsString + 'e39539b8836fb99e1538974d3ac1fe98'
  api.searchParams.append('sign', md5(paramsString))
  let fetch6 = await fetch(api, {mode: 'cors', credentials: 'include'})

  api = new URL(atob("aHR0cHM6Ly93d3cueGluZ3R1LmNuL2gvYXBpL2dhdGV3YXkvaGFuZGxlcl9nZXQv"))
  api.searchParams.append('o_author_id', id)
  api.searchParams.append('platform_source', 1)
  api.searchParams.append('author_type', 1)
  api.searchParams.append('sign_strict', 1)
  api.searchParams.append('service_name', 'data.AdStarDataService')
  api.searchParams.append('service_method', 'GetAuthorFansDistributionV2')

  paramsString = `author_type1o_author_id${id}platform_source1service_methodGetAuthorFansDistributionV2service_namedata.AdStarDataServicesign_strict1`
  paramsString = paramsString + 'e39539b8836fb99e1538974d3ac1fe98'
  api.searchParams.append('sign', md5(paramsString))
  let fetch7 = await fetch(api, {mode: 'cors', credentials: 'include'})

  api = new URL(atob("aHR0cHM6Ly93d3cueGluZ3R1LmNuL2gvYXBpL2dhdGV3YXkvaGFuZGxlcl9nZXQv"))
  api.searchParams.append('o_author_id', id)
  api.searchParams.append('platform_source', 1)
  api.searchParams.append('platform_channel', 1)
  api.searchParams.append('limit', 10)
  api.searchParams.append('sign_strict', 1)
  api.searchParams.append('service_name', 'author.AdStarAuthorService')
  api.searchParams.append('service_method', 'GetAuthorShowItemsV2')

  paramsString = `limit10o_author_id${id}platform_channel1platform_source1service_methodGetAuthorShowItemsV2service_nameauthor.AdStarAuthorServicesign_strict1`
  paramsString = paramsString + 'e39539b8836fb99e1538974d3ac1fe98'
  api.searchParams.append('sign', md5(paramsString))
  let fetch8 = await fetch(api, {mode: 'cors', credentials: 'include'})

  let responses = []
  for(let item of [fetch1, fetch2, fetch3, fetch4, fetch5, fetch6, fetch7, fetch8]){
    responses.push(await item.json());
  }
  let [response1,response2,response3,response4,response5,response6,response7,response8] = responses
  setComplete(old => old + 8)

  let intro = response1.data?.self_intro;
  let score = response2.data.top_score
  let price20 = response3.data.price_info[0]?.price
  let price60 = response3.data.price_info[1]?.price
  let short_id = response4.data.short_id
  let follower = response4.data.follower
  let mcn = response4.data.mcn_name
  let tags = Object.keys(response4.data.tags_relation).join(', ')
  let address = `${response4.data.province}-${response4.data.city}`
  let playOverRate = response5.data.play_over_rate.value
  if(playOverRate!==undefined) {
    playOverRate = (playOverRate/100).toFixed(1)+'%';
  }
  let interactRate = response5.data.interact_rate.value
  if(interactRate!==undefined) {
    interactRate = (interactRate/100).toFixed(1)+'%';
  }
  let {cpm_1_20:cpm20, cpm_21_60:cpm60} = response5.data.expect_cpm
  let sexDistributions = response6.data.distributions[1]
  let [men, women] = sexDistributions.distribution_list
  men = parseInt(men.distribution_value)
  women = parseInt(women.distribution_value)
  let locationDistributions = response6.data.distributions[3]
  let locationAll = locationDistributions.distribution_list.map(item=>parseInt(item.distribution_value)).reduce((a,b)=>{
    return a+b;
  }, 0)
  let locationTop10 = locationDistributions.distribution_list.slice(0, 10).map(item=>{
    return `${item.distribution_key}: ${(item.distribution_value/locationAll*100).toFixed(2)}%`
  }).reduce((a,b)=>[a,b].join(', '))
  let sexDistributionsFans = response7.data.distributions[1]
  let [menFans, womenFans] = sexDistributionsFans.distribution_list
  menFans = parseInt(menFans.distribution_value)
  womenFans = parseInt(womenFans.distribution_value)
  let locationDistributionsFans = response7.data.distributions[3]
  let locationAllFans = locationDistributionsFans.distribution_list.map(item=>parseInt(item.distribution_value)).reduce((a,b)=>{
    return a+b;
  }, 0)
  let locationTop10Fans = locationDistributionsFans.distribution_list.slice(0, 10).map(item=>{
    return `${item.distribution_key}: ${(item.distribution_value/locationAllFans*100).toFixed(2)}%`
  }).reduce((a,b)=>[a,b].join(', '))
  let hyd = response7.data.distributions[2]
  let hydAll = hyd.distribution_list.map(item=>parseInt(item.distribution_value)).reduce((a,b)=>{
    return a+b;
  }, 0)
  hyd = hyd.distribution_list.map(item=>{
    return `${item.distribution_key}: ${(item.distribution_value/hydAll*100).toFixed(2)}%`
  }).reduce((a,b)=>[a,b].join(', '))
  let items = response8.data.latest_star_item_info
  let min=Math.min(...items.map(item=>item.play));
  let likeMin=Math.min(...items.map(item=>item.like));
  let max=Math.max(...items.map(item=>item.play));
  let likeMax=Math.max(...items.map(item=>item.like));
  let playDesc = `最新15个视频中最低播放量 ${(min/10000).toFixed(1)}w 最高播放量 ${(max/10000).toFixed(1)}w`
  let likeDesc = `最新15个视频中最低点赞量 ${(likeMin/10000).toFixed(1)}w 最高点赞量 ${(likeMax/10000).toFixed(1)}w`

  return [...info, follower, short_id, price20, price60, cpm20, cpm60, intro, playOverRate,
    interactRate,playDesc,likeDesc,
    score, mcn, tags, address,
    (men/(men+women)*100).toFixed(2)+'%', (women/(men+women)*100).toFixed(2)+'%', locationTop10,
    (menFans/(menFans+womenFans)*100).toFixed(2)+'%', (womenFans/(menFans+womenFans)*100).toFixed(2)+'%',
    locationTop10Fans, hyd]
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