const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
require('dotenv').config(); // Load .env file
function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true
    }
  });

  mainWindow.loadFile('index.html');
}

app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC events for dynamic agent handling
ipcMain.handle('add-agent', (event, agentData) => {
  event.sender.send('add-agent-response', agentData);
});

ipcMain.handle('remove-agent', (event, agentName) => {
  event.sender.send('remove-agent-response', agentName);
});

ipcMain.handle('update-agents-from-api', async (event, apiUrl) => {
  try {
    const response = await fetch(apiUrl);
    const agents = await response.json();
    event.sender.send('update-agents-from-api-response', agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    event.sender.send('update-agents-from-api-error', error.message);
  }
});

