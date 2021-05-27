import {PouchDBContext} from "./context.js";

export default function AddDocForm(props) {
  const db = React.useContext(PouchDBContext);

  const isEidt = !!props.doc;
  const [data, setData] = React.useState(props.doc ?? {
    "platform": "微博",
    "name": "张三分",
    "id": "545616812",
    "category": "种草",
    "follow_number": 4564654,
    "activate": "45%",
    "accounting_period": "30天",
    "pay_category": "对公",
    "vendor": "文档问号",
    "vendor_account": `苏州铃铛文化传播有限公司\n
银行：中国银行股份有限公司昆山衡山路支行\n
账号：459871549669`
  })

  async function addDoc() {
    if (!data._id) {
      data._id = `data/${data.platform}/${data.name}`
    }
    let {rev} = await db.put(data);
    data._rev = rev;
    return data;
  }

  window.batchAdd = (count) => {
    for (let idx=0; idx < count; idx ++) {
      data.name = `张三分${idx}`
      data._id = `data/${data.platform}/${data.name}`
      data.follow_number = idx
    db.put(data, function callback(err, result) {
      if (!err) {
        console.log('Successfully posted a data!');
      }
    });
    }
  }

  return <div className="ui form">
  <div className={`field ${isEidt && 'disabled'}`}>
    <label>平台</label>
    <input value={data.platform} onChange={(event) => setData(old => { return {...old, platform: event.target.value}})}/>
  </div>
  <div className={`field ${isEidt && 'disabled'}`}>
    <label>账号名称</label>
    <input value={data.name} onChange={(event) => setData(old => {
      return {
        ...old, name: event.target.value
      }})}/>
  </div>
  <div className="field">
    <label>ID/链接</label>
    <input value={data.id} onChange={(event) => setData(old => {
      return {
        ...old, id: event.target.value
      }})}/>
  </div>
  <div className="field">
    <label>类别</label>
    <input value={data.category} onChange={(event) => setData(old => {
      return {
        ...old, category: event.target.value
      }})}/>
  </div>
  <div className="field">
    <label>粉丝活跃度</label>
    <input value={data.activate} onChange={(event) => setData(old => {
      return {
        ...old, activate: event.target.value
      }})}/>
  </div>
  <div className="field">
    <label>账期</label>
    <input value={data.accounting_period} onChange={(event) => setData(old => {
      return {
        ...old, accounting_period: event.target.value
      }})}/>
  </div>
  <div className="field">
    <label>付款形式</label>
    <input value={data.pay_category} onChange={(event) => setData(old => {
      return {
        ...old, pay_category: event.target.value
      }})}/>
  </div>
  <div className="field">
    <label>供应商名称</label>
    <input value={data.vendor} onChange={(event) => setData(old => {
      return {
        ...old, vendor: event.target.value
      }})}/>
  </div>
  <div className="field">
    <label>供应商账户</label>
    <textarea value={data.vendor_account} onChange={(event) => setData(old => {
      return {
        ...old, vendor_account: event.target.value
      }})}/>
  </div>
  <div className="field">
    <label>粉丝量</label>
    <input type="number" value={data.follow_number} onChange={(event) => setData(old => {
      return {
        ...old, follow_number: event.target.value
      }})}/>
  </div>
    <div className="ui buttons">
      <button className="positive ui button" type="submit" onClick={async () => {
        props.closeForm(await addDoc());
      }}>保存
      </button>
      <div className="or"></div>
      <button className="ui button" onClick={() => props.closeForm()}>取消</button>
    </div>

</div>
}