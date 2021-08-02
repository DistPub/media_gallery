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