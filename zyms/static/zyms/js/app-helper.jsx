export default function AppHelper(props) {
  return <div className="ui message">
    <div className="header">[应用故障]请升级Chrome或稍后重试</div>
    {props.error.message.includes('Failed to fetch dynamically imported module') && <p>请确保chrome://flags/#enable-experimental-web-platform-features开启</p>}
    {props.error.stack === 'SyntaxError: Unexpected identifier' && <p>请确保chrome配置了启动参数--js-flags="--harmony-import-assertions"</p>}
    <p>错误信息</p>
    <code>{props.error.stack}</code>
  </div>
}