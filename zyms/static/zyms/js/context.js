import dshell from 'https://cdn.jsdelivr.net/npm/dshell@1.4.0/dshell.js';

await dshell.init();
export const ShellContext = React.createContext(dshell);
export const ModalContainer = React.createContext(document.querySelector('#modal'));

async function initDB(name) {
  let db = new PouchDB(name);
  let username = sessionStorage.getItem('username');

  if (!username) {
    username = prompt("请输入用户名", "<username>");
    if (username) {
      sessionStorage.setItem('username', username);
    }
  }

  let password = sessionStorage.getItem('password');

  if (!password) {
    password = prompt("请输入密码", "<password>");
    if (password) {
      sessionStorage.setItem('password', password);
    }
  }

  let remoteCouch = `https://${username}:${password}@relax.smitechow.com/${name}`;
  let opts = {live: true, retry: true};
  db.replicate.to(remoteCouch, opts, console.error);
  db.replicate.from(remoteCouch, opts, console.error);
  await db.createIndex({
    index: {fields: ['name', 'id', 'category', 'platform']},
    ddoc: 'search-index'
  });
  await db.createIndex({
    index: {fields: ['follow_number']},
    ddoc: 'sort-index'
  });
  return db;
}

let db = await initDB('zyms');
export const PouchDBContext = React.createContext(db);

const Consts = {};

async function getEnums(name, defaultValue) {
  try {
    return (await db.get(`consts/${name}`)).value;
  } catch (error) {
    await db.put({_id: `consts/${name}`, value: defaultValue})
    return defaultValue;
  }
}

Consts.category = await getEnums('category', []);
Consts.platform = await getEnums('platform', []);
export const ConstsContext = React.createContext(Consts);