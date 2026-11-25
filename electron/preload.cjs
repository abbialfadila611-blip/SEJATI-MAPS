const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('sejatiDesktop', {
  platform: process.platform,
  isElectron: true,
});
