const { contextBridge, ipcRenderer } = require('electron');

// 安全地暴露Electron API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    // 调用主进程方法
    invoke: (channel, data) => {
        const validChannels = ['get-stock-data', 'get-settings', 'update-settings', 'fetch-stock-data', 'refresh-stock-data', 'hide-floating-window', 'show-main-window', 'hide-main-window'];
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, data);
        }
        return Promise.reject(new Error('Invalid channel'));
    },

    // 监听主进程消息
    on: (channel, callback) => {
        const validChannels = ['stock-data-updated', 'open-settings', 'update-stock-display'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => callback(...args));
        }
    },

    // 移除监听器
    removeAllListeners: (channel) => {
        const validChannels = ['stock-data-updated', 'open-settings', 'update-stock-display'];
        if (validChannels.includes(channel)) {
            ipcRenderer.removeAllListeners(channel);
        }
    }
});
