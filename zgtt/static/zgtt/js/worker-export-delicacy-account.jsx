import MemoExportDelicacyAccountButton from "./export-delicacy-account-button.jsx";
import {getCode, requestExtension} from "./utils.js";

const workerType = 'export-delicacy-account';

function checker(historyRequests) {
  const urlKey = atob("aHR0cHM6Ly93d3cueGluZ3R1LmNuL3YvYXBpL2RlbWFuZC9hdXRob3JfbGlzdC8=");
  const urlTarget = atob('aHR0cHM6Ly93d3cueGluZ3R1LmNuL2FkL2NyZWF0b3IvbWFya2V0');

  let urls = Object.values(historyRequests).filter(item=>{
    return item.url.startsWith(urlKey);
  })
  return urls.length && location.href === urlTarget;
}

function maker(historyRequests) {
  const urlKey = atob("aHR0cHM6Ly93d3cueGluZ3R1LmNuL3YvYXBpL2RlbWFuZC9hdXRob3JfbGlzdC8=");
  const workerType = 'export-delicacy-account';

  let last = Object.values(historyRequests).filter(item=>{
    return item.url.startsWith(urlKey);
  }).sort((a, b)=>{
    return a.timeStamp<b.timeStamp?1:-1;
  })[0];
  let url = new URL(last.url);
  return {
    type: workerType,
    searchParams: Object.fromEntries(url.searchParams.entries()),
    description: document.querySelector('.selected-filter .selected-list')?.innerText
  };
}

export default function WorkerExportDelicacyAccount(props) {
  React.useEffect(async () => {
    await requestExtension({
      method: "add-feature-plus",
      name: '批量导出',
      checker: getCode(checker),
      maker: getCode(maker)
    });
  }, []);

  return <>{props.pool.length>0 && <div className="ui segment">
  {
    props.pool.filter(([_, flow]) => flow.type === workerType).map(([maxPage, flow], idx) =>
      <MemoExportDelicacyAccountButton key={idx} idxStr={idx.toString()} maxPage={maxPage} flow={flow}/>
    )
  }
  </div>}</>;
}
