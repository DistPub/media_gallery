import uuidv4 from 'https://cdn.jsdelivr.net/npm/uuid@8.3.2/dist/esm-browser/v4.js';

export function absURL(relative, base) {
  const url = new URL(relative, base)
  return url.href
}

const messageCallback = {};
window.addEventListener('message', event=>{
  if (event.source !== window) {
    return;
  }

  if (event.data.source === 'edge-lover-bridge') {
    messageCallback[event.data.id](event.data.payload);
    delete messageCallback[event.data.id];
  }
});

export function requestExtension(message) {
  let id = uuidv4();
  window.postMessage({destination: 'edge-lover-bridge', payload: message, id});
  return new Promise(resolve => messageCallback[id] = resolve);
}

export function getCode(func) {
  let code = func.toString().slice(0, -1);
  let start = code.indexOf('{');
  return code.slice(start + 1, -1);
}