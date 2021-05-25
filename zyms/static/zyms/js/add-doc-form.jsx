import {PouchDBContext} from "./context.js";

export default function AddDocForm(props) {
  const db = React.useContext(PouchDBContext);

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

  function addDoc() {
    data._id = `${data.platform}|${data.name}`
    db.put(data, function callback(err, result) {
      if (!err) {
        console.log('Successfully posted a data!');
      }
    });
  }

  window.batchAdd = () => {
    for (let idx=0; idx < 300; idx ++) {
      data._id = `${data.platform}|${data.name}${idx}`
    db.put(data, function callback(err, result) {
      if (!err) {
        console.log('Successfully posted a data!');
      }
    });
    }
  }

  return <form className="ui form">
  <div className="field">
    <label>平台</label>
    <input value={data.platform} onChange={(event) => setData(old => { return {...old, platform: event.target.value}})}/>
  </div>
  <div className="field">
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
  <button className="ui button" type="submit" onClick={() => {
    addDoc();
    props.closeForm();
  }}>保存</button>
</form>
}