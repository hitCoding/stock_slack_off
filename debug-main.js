const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

// 创建主窗口
function createWindow() {
    console.log('正在创建主窗口...');

    mainWindow = new BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            enableRemoteModule: false,
            webSecurity: true,
            allowRunningInsecureContent: false
        },
        icon: path.join(__dirname, 'assets/icon.png'),
        show: true, // 窗口显示
        resizable: false,
        minimizable: false,
        maximizable: false,
        skipTaskbar: false, // 在任务栏显示
        alwaysOnTop: false
    });

    console.log('主窗口已创建，正在加载HTML文件...');
    mainWindow.loadFile('index.html');

    // 设置任务栏标题
    mainWindow.setTitle('股票行情小工具 - 测试');

    // 开发模式下显示开发者工具
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
        console.log('开发模式已启用，开发者工具已打开');
    }

    console.log('主窗口创建完成');
}

// 应用事件处理
app.whenReady().then(() => {
    console.log('应用已准备就绪，开始初始化...');
    
    createWindow();
    
    // 在macOS上，当所有窗口都关闭时，重新创建一个窗口
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
    
    console.log('应用初始化完成');
});

// 当所有窗口都关闭时退出应用
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 处理应用退出
app.on('quit', () => {
    console.log('应用退出');
});
