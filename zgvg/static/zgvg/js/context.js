import shell from 'https://cdn.jsdelivr.net/npm/dshell@1.4.0/dshell.js'
export const ShellContext = React.createContext(shell)
export const InitedShellContext = React.createContext(false)
export const ModalContainer = React.createContext(document.querySelector('#modal'))