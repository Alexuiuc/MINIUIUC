const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendInputToBackend: (input) => ipcRenderer.invoke('send-input-to-backend', input)
});
