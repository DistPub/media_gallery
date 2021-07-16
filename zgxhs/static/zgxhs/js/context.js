import dshell from 'https://cdn.jsdelivr.net/npm/dshell@1.4.0/dshell.js';

await dshell.init();
export const ShellContext = React.createContext(dshell);
export const ModalContainer = React.createContext(document.querySelector('#modal'));

async function initDB(name) {
  let db = new PouchDB(name);
  let remoteCouch = `https://relax.smitechow.com/${name}`;
  let opts = {live: true, retry: true};
  db.replicate.to(remoteCouch, opts, console.error);
  db.replicate.from(remoteCouch, opts, console.error);
  await db.createIndex({
    index: {fields: ['type', 'status']},
    ddoc: 'search-index'
  });
  await db.createIndex({
    index: {fields: ['created']},
    ddoc: 'sort-index'
  });
  return db;
}

let db = await initDB('tasks');
export const PouchDBContext = React.createContext(db);
