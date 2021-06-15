import {defaultDocLabel, defaultDocLabelInverted} from "./consts.js";

export function getPages(total, size) {
  let pages = parseInt(total / size);
  if (total % size !== 0) {
    pages ++;
  }
  return pages;
}

let replaceKey = mapping => {
  return item => {
    let replaced = {};
    for (let key in item) {
      replaced[mapping[key]] = item[key];
    }
    return replaced;
  }
}

export const replaceKeyToLabel = replaceKey(defaultDocLabel);
export const replaceLabelToKey = replaceKey(defaultDocLabelInverted);