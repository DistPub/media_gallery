const root = document.querySelector('#root')
const fallback = (error) => {
  setTimeout(async () => {
    if (root.children.length) {
      return
    }
    // 白屏
    const AppHelper = React.lazy(()=>import('./app-helper.jsx'))
    ReactDOM.render(<React.Suspense fallback={<>应用故障，正在打开帮助...</>}><AppHelper error={error}/></React.Suspense>, root)
  }, 0)
}
window.onerror = (message, file, line, column, error) => {
  fallback(error)
  return false
}

(async () => {
  try {
    const Main = React.lazy(()=>import('./main.jsx'))
    ReactDOM.render(<React.Suspense fallback={<>正在打开应用...</>}><Main/></React.Suspense>, root)
  } catch (error) {
    fallback(error)
  }
})()