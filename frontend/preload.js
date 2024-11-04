const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendInputToBackend: (input) => ipcRenderer.invoke('send-input-to-backend', input)

});

contextBridge.exposeInMainWorld('env', {
  API_URL: process.env.API_URL || 'http://127.0.0.1:5000/api'
});