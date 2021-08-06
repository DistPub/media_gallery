import {ChromeExtensionID} from 'settings';

export function absURL(relative, base) {
  const url = new URL(relative, base)
  return url.href
}

export function requestExtension(message) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(ChromeExtensionID, message, resolve)}
  )
}

export function getCode(func) {
  let code = func.toString().slice(0, -1);
  let start = code.indexOf('{');
  return code.slice(start + 1, -1);
}