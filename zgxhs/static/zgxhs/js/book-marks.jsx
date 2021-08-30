import {Header} from "./components.jsx";

export default function BookMarks() {
    return <>
        <Header title={'书签工具'} subTitle={'请拖动按钮到书签栏，在目标网页点击书签工具进行使用'}/>
        <a className="ui button" href="javascript:Array.from(document.querySelectorAll('span')).map(item=>item.contentEditable=true)">网页span编辑模式</a>
    </>
}