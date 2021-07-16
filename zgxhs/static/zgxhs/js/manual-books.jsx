import {Header} from "./components.jsx";

export default function ManualBooks(props) {
  return <><Header title={'使用手册'} subTitle={'请充分理解流程'}/>
  <ol>
    <li>在Android手机上安装，运行Worker App</li>
    <li>在任务创建文本框中输入参数，点击按钮创建异步任务</li>
    <li>Android Worker App会自动执行异步任务，提交结果</li>
    <li>在任务列表中查看任务状态，下载任务执行结果</li>
  </ol></>
}