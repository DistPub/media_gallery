import dshell from 'https://cdn.jsdelivr.net/npm/dshell@1.4.0/dshell.js';

await dshell.init();
export const ShellContext = React.createContext(dshell);
export const ModalContainer = React.createContext(document.querySelector('#modal'));

function initDBContext(name) {
  let db = new PouchDB(name);
  let username = sessionStorage.getItem('username');

  if (!username) {
    username = prompt("请输入用户名", "<username>");
    sessionStorage.setItem('username', username);
  }

  let password = sessionStorage.getItem('password');

  if (!password) {
    password = prompt("请输入密码", "<password>");
    sessionStorage.setItem('password', password);
  }

  let remoteCouch = `https://${username}:${password}@relax.smitechow.com/todos`;
  let opts = {live: true};
  db.replicate.to(remoteCouch, opts, console.error);
  db.replicate.from(remoteCouch, opts, console.error);
  return React.createContext(db);
}

export const PouchDBContext = initDBContext('todos')