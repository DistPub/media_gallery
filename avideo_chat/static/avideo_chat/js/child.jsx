import {NestChild} from "./libs/test.jsx"

export function Child(props) {
  return <span>this is child<NestChild/><button onClick={props.changeLang}>toggle lang</button></span>
}

export function NotUsed(props) {
  return <h1>ddd</h1>
}