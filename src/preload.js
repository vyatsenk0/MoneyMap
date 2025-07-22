// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts


const { contextBridge, ipcRenderer } = require('electron');

// use contextBridge to safely expose the ipcRenderer API to the renderer process:
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: ipcRenderer.invoke,
    send: ipcRenderer.send,  // If you need to send messages too
  },
});