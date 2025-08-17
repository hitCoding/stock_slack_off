const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen } = require('electron');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');

let mainWindow;
let floatingWindow; // 悬浮窗口
let tray;
let stockData = new Map();
let stockCodes = ['000001', '600000', '000858', '00001', '00700']; // 默认股票代码
let currentStockIndex = 0; // 当前显示的股票索引

// 定时器配置
let stockDisplayInterval = 3000; // 股票显示轮播间隔（毫秒）
let dataRefreshInterval = 30000; // 数据刷新间隔（毫秒）

// 中文股票名称到拼音缩写的映射
let chineseToPinyinMap = {
    '平安银行': 'PAYH',
    '浦发银行': 'PFYH',
    '五粮液': 'WLY',
    '万科A': 'WKA',
    '招商银行': 'ZSYH',
    '贵州茅台': 'GZMT',
    '长江实业': 'CJSY',
    '腾讯控股': 'TXKG',
    '中国移动': 'ZGYD',
    '中国平安': 'ZGPA'
};

// 获取配置文件目录（始终使用 exe 所在目录，确保配置文件不被打包）
function getUserDataPath() {
    // 无论是开发环境还是生产环境，都优先使用 exe 所在目录
    try {
        // 获取 exe 文件所在目录
        const exeDir = process.execPath ? path.dirname(process.execPath) : __dirname;
        console.log('📁 可执行文件目录:', exeDir);

        // 检查 exe 目录中是否存在配置文件
        const configInExeDir = path.join(exeDir, 'stock-codes.json');
        if (fs.existsSync(configInExeDir)) {
            console.log('✅ 在可执行文件目录中找到配置文件');
            return exeDir;
        }

        // 如果 exe 目录中没有配置文件，使用当前工作目录
        const currentDir = process.cwd();
        console.log('📁 当前工作目录:', currentDir);

        // 检查当前工作目录中是否存在配置文件
        const configInCurrentDir = path.join(currentDir, 'stock-codes.json');
        if (fs.existsSync(configInCurrentDir)) {
            console.log('✅ 在当前工作目录中找到配置文件');
            return currentDir;
        }

        // 如果都没有找到，使用 exe 目录（用户需要手动创建配置文件）
        console.log('📝 未找到配置文件，将使用可执行文件目录');
        return exeDir;

    } catch (error) {
        console.warn('⚠️ 路径解析失败，使用当前目录:', error.message);
        return __dirname;
    }
}

// 获取资源文件路径（始终使用当前目录）
function getResourcePath(relativePath) {
    // 始终使用当前目录，确保资源文件从正确位置加载
    const resourcePath = path.join(__dirname, relativePath);

    // 检查文件是否存在，如果不存在则记录警告
    if (!fs.existsSync(resourcePath)) {
        console.warn(`⚠️ 资源文件不存在: ${resourcePath}`);
        console.warn(`📁 当前目录: ${__dirname}`);
        console.warn(`🔍 尝试查找的文件: ${relativePath}`);
    }

    return resourcePath;
}

// 验证必需的资源文件
function validateResourceFiles() {
    const requiredFiles = [
        'assets/icon.png',
        'index.html',
        'floating.html',
        'preload.js'
    ];

    console.log('🔍 验证必需的资源文件...');
    console.log('📁 当前目录:', __dirname);

    let missingFiles = [];

    requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file} - 存在`);
        } else {
            console.warn(`❌ ${file} - 不存在`);
            missingFiles.push(file);
        }
    });

    if (missingFiles.length > 0) {
        console.warn('⚠️ 以下必需文件缺失:');
        missingFiles.forEach(file => console.warn(`   - ${file}`));
        console.warn('📝 请确保这些文件在当前目录中存在');
    } else {
        console.log('✅ 所有必需的资源文件都存在');
    }

    return missingFiles.length === 0;
}

// 股票代码配置文件路径
const STOCK_CODES_FILE = path.join(getUserDataPath(), 'stock-codes.json');
// 股票名称配置文件路径
const STOCK_NAMES_CONFIG_FILE = path.join(getUserDataPath(), 'stock-names-config.json');
let stockDisplayTimer = null; // 股票显示轮播定时器
let dataRefreshTimer = null; // 数据刷新定时器

// 读取股票代码配置文件
function loadStockCodes() {
    try {
        console.log('🔍 尝试加载配置文件:', STOCK_CODES_FILE);
        console.log('📁 配置文件目录:', getUserDataPath());
        console.log('📁 当前目录:', __dirname);

        if (fs.existsSync(STOCK_CODES_FILE)) {
            const data = fs.readFileSync(STOCK_CODES_FILE, 'utf8');
            const config = JSON.parse(data);
            stockCodes = config.stockCodes || ['000001', '600000', '000858', '00001', '00700'];

            // 读取定时器配置
            if (config.timers) {
                stockDisplayInterval = config.timers.stockDisplayInterval || 3000;
                dataRefreshInterval = config.timers.dataRefreshInterval || 30000;
                console.log('✅ 已从配置文件加载定时器配置:');
                console.log('   - 股票显示轮播间隔:', stockDisplayInterval, '毫秒');
                console.log('   - 数据刷新间隔:', dataRefreshInterval, '毫秒');
            }

            console.log('✅ 已从配置文件加载股票代码:', stockCodes);
        } else {
            console.log('📝 配置文件不存在，使用默认股票代码');
            console.log('📝 尝试创建配置文件...');
            saveStockCodes(); // 创建默认配置文件
        }
    } catch (error) {
        console.error('❌ 读取股票代码配置文件失败:', error);
        console.log('🔄 使用默认股票代码');
    }
}

// 读取股票名称配置文件
function loadStockNamesConfig() {
    try {
        if (fs.existsSync(STOCK_NAMES_CONFIG_FILE)) {
            const data = fs.readFileSync(STOCK_NAMES_CONFIG_FILE, 'utf8');
            const config = JSON.parse(data);
            if (config.stockNames) {
                chineseToPinyinMap = { ...chineseToPinyinMap, ...config.stockNames };
                console.log('✅ 已从配置文件加载股票名称映射，共', Object.keys(config.stockNames).length, '个');
            }
        } else {
            console.log('📝 股票名称配置文件不存在，使用默认映射');
        }
    } catch (error) {
        console.error('❌ 读取股票名称配置文件失败:', error);
        console.log('🔄 使用默认股票名称映射');
    }
}

// 保存股票代码到配置文件
function saveStockCodes() {
    try {
        console.log('💾 尝试保存配置文件到:', STOCK_CODES_FILE);

        // 确保目录存在
        const configDir = path.dirname(STOCK_CODES_FILE);
        if (!fs.existsSync(configDir)) {
            console.log('📁 创建配置目录:', configDir);
            fs.mkdirSync(configDir, { recursive: true });
        }

        const config = {
            stockCodes: stockCodes,
            lastUpdated: new Date().toISOString(),
            timers: {
                stockDisplayInterval: stockDisplayInterval,
                dataRefreshInterval: dataRefreshInterval
            }
        };
        fs.writeFileSync(STOCK_CODES_FILE, JSON.stringify(config, null, 2), 'utf8');
        console.log('✅ 股票代码和定时器配置已保存到配置文件:', stockCodes);
        console.log('✅ 配置文件路径:', STOCK_CODES_FILE);
    } catch (error) {
        console.error('❌ 保存股票代码配置文件失败:', error);
        console.error('❌ 错误详情:', error.message);
        console.error('❌ 错误堆栈:', error.stack);
    }
}

// 创建主窗口
function createWindow() {
    console.log('正在创建主窗口...');

    mainWindow = new BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: getResourcePath('preload.js'),
            enableRemoteModule: false,
            webSecurity: false, // 禁用 Web 安全以允许本地资源
            allowRunningInsecureContent: true, // 允许不安全内容
            // 禁用缓存相关功能
            enableWebSQL: false,
            // 设置缓存策略
            partition: 'persist:main'
        },
        icon: getResourcePath('assets/icon.png'),
        show: false, // 窗口显示
        resizable: false,
        minimizable: true, // 允许最小化
        maximizable: false,
        skipTaskbar: false,
        alwaysOnTop: false
    });

    console.log('主窗口已创建，正在加载HTML文件...');
    mainWindow.loadFile(getResourcePath('index.html'));

    // 设置任务栏标题
    mainWindow.setTitle('股票行情小工具');

    // 监听窗口最小化事件
    mainWindow.on('minimize', () => {
        try {
            console.log('主窗口已最小化，显示悬浮窗口');
            showFloatingWindow();
        } catch (error) {
            console.error('处理窗口最小化事件失败:', error);
        }
    });

    // 监听窗口恢复事件
    mainWindow.on('restore', () => {
        try {
            console.log('主窗口已恢复，隐藏悬浮窗口');
            hideFloatingWindow();
        } catch (error) {
            console.error('处理窗口恢复事件失败:', error);
        }
    });

    // 开发模式下显示开发者工具
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
        console.log('开发模式已启用，开发者工具已打开');
    }

    console.log('主窗口创建完成');
}

// 创建悬浮窗口（类似歌词显示）
function createFloatingWindow() {
    console.log('正在创建悬浮窗口...');

    // 获取主屏幕尺寸
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    // 获取任务栏高度（通常为40-60像素）
    const taskbarHeight = 50; // 默认任务栏高度

    // 计算悬浮窗口位置（任务栏上方）
    const floatingWidth = 300;
    const floatingHeight = taskbarHeight; // 高度与任务栏一致
    const floatingX = width - floatingWidth - 200; // 右下角，距离右边缘20px
    const floatingY = height - 20; // 紧贴任务栏上方
    console.log('floatingX', floatingX);
    console.log('floatingY', floatingY);
    console.log('Width', width);
    console.log('Height', height);
    floatingWindow = new BrowserWindow({
        width: floatingWidth,
        height: floatingHeight,
        x: floatingX,
        y: floatingY,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: getResourcePath('preload.js'),
            enableRemoteModule: false,
            webSecurity: false, // 禁用 Web 安全以允许本地资源
            allowRunningInsecureContent: true, // 允许不安全内容
            // 禁用缓存相关功能
            enableWebSQL: false,
            // 设置缓存策略
            partition: 'persist:floating'
        },
        icon: getResourcePath('assets/icon.png'),
        show: false, // 初始隐藏
        resizable: true, // 允许调整大小
        minimizable: false,
        maximizable: false,
        skipTaskbar: true, // 不在任务栏显示
        alwaysOnTop: true, // 始终置顶
        frame: false, // 无边框
        transparent: true, // 透明背景
        focusable: false, // 不可获得焦点
        webSecurity: false, // 允许加载本地资源
        minWidth: 100, // 最小宽度
        minHeight: 30, // 最小高度
        maxWidth: 600, // 最大宽度
        maxHeight: 200, // 最大高度
        type: 'toolbar', // 设置为工具栏类型，确保置顶
        visibleOnAllWorkspaces: true, // 在所有工作区可见
        //opacity: 0.0 // 完全透明
    });

    // 加载悬浮窗口HTML
    floatingWindow.loadFile(getResourcePath('floating.html'));

    // 设置窗口属性
    floatingWindow.setIgnoreMouseEvents(false, { forward: true });
    floatingWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    // 强制设置置顶
    floatingWindow.setAlwaysOnTop(true, 'screen-saver');
    floatingWindow.setAlwaysOnTop(true, 'floating');

    // 监听窗口大小变化
    floatingWindow.on('resize', () => {
        try {
            if (floatingWindow && !floatingWindow.isDestroyed()) {
                const [newWidth, newHeight] = floatingWindow.getSize();
                console.log(`悬浮窗口大小已调整: ${newWidth}x${newHeight}`);
            }
        } catch (error) {
            console.error('处理悬浮窗口大小变化事件失败:', error);
        }
    });

    // 监听窗口位置变化
    floatingWindow.on('moved', () => {
        try {
            if (floatingWindow && !floatingWindow.isDestroyed()) {
                const [newX, newY] = floatingWindow.getPosition();
                console.log(`悬浮窗口位置已调整: ${newX}, ${newY}`);
            }
        } catch (error) {
            console.error('处理悬浮窗口位置变化事件失败:', error);
        }
    });

    // 确保窗口始终置顶
    floatingWindow.on('show', () => {
        try {
            if (floatingWindow && !floatingWindow.isDestroyed()) {
                floatingWindow.setAlwaysOnTop(true, 'screen-saver');
                floatingWindow.setSize(150, 30);
                floatingWindow.setAlwaysOnTop(true, 'floating');
            }
        } catch (error) {
            console.error('设置悬浮窗口置顶失败:', error);
        }
    });



    console.log('悬浮窗口已创建');
}

// 显示悬浮窗口
function showFloatingWindow() {
    try {
        if (floatingWindow && !floatingWindow.isDestroyed()) {

            if (floatingX > 1050) {
                floatingWindow.setPosition(floatingX, floatingX - 50);
            }
            floatingWindow.setAlwaysOnTop(true, 'screen-saver');
            floatingWindow.setAlwaysOnTop(true, 'floating');
            floatingWindow.hide();
            floatingWindow.show();
            console.log('✅ 悬浮窗口已显示');
        } else {
            console.warn('⚠️ 悬浮窗口不存在或已销毁，重新创建');
            createFloatingWindow();
            if (floatingWindow && !floatingWindow.isDestroyed()) {
                floatingWindow.show();
                floatingWindow.setAlwaysOnTop(true, 'screen-saver');
                floatingWindow.setAlwaysOnTop(true, 'floating');
                console.log('✅ 悬浮窗口已重新创建并显示');
            }
        }
    } catch (error) {
        console.error('❌ 显示悬浮窗口失败:', error);
        // 尝试重新创建悬浮窗口
        try {
            createFloatingWindow();
            if (floatingWindow && !floatingWindow.isDestroyed()) {
                floatingWindow.show();
                console.log('✅ 悬浮窗口已重新创建并显示');
            }
        } catch (recreateError) {
            console.error('❌ 重新创建悬浮窗口也失败:', recreateError);
        }
    }
}

// 隐藏悬浮窗口
function hideFloatingWindow() {
    if (floatingWindow && !floatingWindow.isDestroyed()) {
        floatingWindow.hide();
        console.log('悬浮窗口已隐藏');
    }
}

// 更新悬浮窗口显示
function updateFloatingDisplay() {
    if (stockData.size === 0 || !floatingWindow || floatingWindow.isDestroyed()) return;

    try {
        const stockArray = Array.from(stockData.values());
        const currentStock = stockArray[currentStockIndex];

        if (currentStock) {
            // 判断是否为港股
            const isHKStock = currentStock.code.length === 5 && currentStock.code.startsWith('0');

            // 构建显示文本
            const changeSymbol = parseFloat(currentStock.change) >= 0 ? '↗' : '↘';
            const changeColor = parseFloat(currentStock.change) >= 0 ? '🟢' : '🔴';

            // 生成股票代码缩写
            let codeAbbr = currentStock.code;
            if (isHKStock) {
                // 港股：显示后4位，如 00001 -> 0001, 00700 -> 0700
                codeAbbr = currentStock.code.slice(-4);
            } else {
                // A股：显示后3位，如 000001 -> 001, 600000 -> 000
                codeAbbr = currentStock.code.slice(-3);
            }

            // 获取股票名称的拼音首字母缩写
            let nameAbbr = getStockNameAbbr(currentStock.name);

            // 如果没有找到拼音缩写，使用股票代码后3位
            if (!nameAbbr) {
                if (isHKStock) {
                    nameAbbr = currentStock.code.slice(-3); // 港股显示后3位
                } else {
                    nameAbbr = currentStock.code.slice(-3); // A股显示后3位
                }
            }

            // 发送数据到悬浮窗口
            floatingWindow.webContents.send('update-stock-display', {
                code: codeAbbr,
                name: currentStock.name,
                nameAbbr: nameAbbr,
                currentPrice: currentStock.price,
                change: currentStock.change,
                changePercent: currentStock.changePercent,
                changeSymbol: changeSymbol,
                changeColor: changeColor
            });

            // console.log(`悬浮窗口显示: ${currentStock.code} ${currentStock.price.toFixed(isHKStock ? 3 : 2)} ${changeSymbol}${currentStock.change.toFixed(isHKStock ? 3 : 2)}`);
        }

        // 移动到下一个股票
        currentStockIndex = (currentStockIndex + 1) % stockArray.length;

    } catch (error) {
        console.error('更新悬浮窗口显示失败:', error);
    }
}

// 创建系统托盘
function createTray() {
    try {
        console.log('正在创建系统托盘...');

        // 创建托盘图标
        const iconPath = getResourcePath('assets/icon.png');
        let icon = nativeImage.createFromPath(iconPath);

        // 根据平台调整图标大小和设置
        if (process.platform === 'darwin') {
            // macOS: 状态栏图标需要特殊处理
            // 首先尝试加载@2x版本（如果存在）
            const icon2xPath = getResourcePath('assets/icon@2x.png');
            const icon3xPath = getResourcePath('assets/icon@3x.png');

            try {
                if (require('fs').existsSync(icon2xPath)) {
                    const icon2x = nativeImage.createFromPath(icon2xPath);
                    icon = icon2x.resize({ width: 18, height: 18 });
                    console.log('使用@2x图标');
                } else if (require('fs').existsSync(icon3xPath)) {
                    const icon3x = nativeImage.createFromPath(icon3xPath);
                    icon = icon3x.resize({ width: 18, height: 18 });
                    console.log('使用@3x图标');
                } else {
                    // 如果没有@2x或@3x，则使用原始图标并调整大小
                    icon = icon.resize({ width: 18, height: 18 });
                    console.log('使用原始图标，调整到18x18');
                }
            } catch (error) {
                console.log('图标处理失败，使用默认设置:', error.message);
                icon = icon.resize({ width: 18, height: 18 });
            }
        } else if (process.platform === 'win32') {
            // Windows: 系统托盘图标使用16x16
            icon = icon.resize({ width: 16, height: 16 });
        } else {
            // Linux: 使用16x16
            icon = icon.resize({ width: 16, height: 16 });
        }

        // 创建托盘
        tray = new Tray(icon);
        tray.setToolTip('股票行情小工具 - 点击显示窗口');

        // 创建托盘菜单
        const contextMenu = Menu.buildFromTemplate([
            {
                label: '显示窗口',
                click: () => {
                    try {
                        if (mainWindow && !mainWindow.isDestroyed()) {
                            mainWindow.show();
                            mainWindow.focus();
                            mainWindow.restore(); // 确保窗口从最小化状态恢复
                            hideFloatingWindow();
                        } else {
                            console.warn('⚠️ 主窗口不存在或已销毁，重新创建');
                            createWindow();
                            if (mainWindow && !mainWindow.isDestroyed()) {
                                mainWindow.show();
                                mainWindow.focus();
                                mainWindow.restore();
                                hideFloatingWindow();
                                console.log('✅ 主窗口已重新创建并显示');
                            }
                        }
                    } catch (error) {
                        console.error('显示主窗口失败:', error);
                        // 尝试重新创建主窗口
                        try {
                            createWindow();
                            if (mainWindow && !mainWindow.isDestroyed()) {
                                mainWindow.show();
                                mainWindow.focus();
                                console.log('✅ 主窗口已重新创建并显示');
                            }
                        } catch (recreateError) {
                            console.error('❌ 重新创建主窗口也失败:', recreateError);
                        }
                    }
                }
            },
            {
                label: '隐藏窗口',
                click: () => {
                    try {
                        if (mainWindow && !mainWindow.isDestroyed()) {
                            mainWindow.hide();
                            showFloatingWindow();
                        }
                    } catch (error) {
                        console.error('隐藏主窗口失败:', error);
                    }
                }
            },
            { type: 'separator' },
            {
                label: '刷新东方财富数据',
                click: () => {
                    try {
                        fetchRealStockData();
                    } catch (error) {
                        console.error('刷新数据失败:', error);
                    }
                }
            },
            { type: 'separator' },
            {
                label: '恢复窗口',
                click: () => {
                    try {
                        console.log('🔄 手动触发窗口恢复');
                        checkAndRestoreWindows();
                    } catch (error) {
                        console.error('手动恢复窗口失败:', error);
                    }
                }
            },
            { type: 'separator' },
            {
                label: '退出',
                click: () => {
                    try {
                        app.quit();
                    } catch (error) {
                        console.error('退出应用失败:', error);
                        process.exit(0);
                    }
                }
            }
        ]);

        // 设置托盘菜单
        tray.setContextMenu(contextMenu);

        // 托盘点击事件
        tray.on('click', () => {
            try {
                if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
                    mainWindow.hide();
                    showFloatingWindow();
                } else if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.show();
                    mainWindow.focus();
                    mainWindow.restore(); // 确保窗口从最小化状态恢复
                    hideFloatingWindow();
                } else {
                    console.warn('⚠️ 主窗口不存在或已销毁，重新创建');
                    createWindow();
                    if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.show();
                        mainWindow.focus();
                        mainWindow.restore();
                        hideFloatingWindow();
                        console.log('✅ 主窗口已重新创建并显示');
                    }
                }
            } catch (error) {
                console.error('托盘点击事件处理失败:', error);
                // 尝试重新创建主窗口
                try {
                    createWindow();
                    if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.show();
                        mainWindow.focus();
                        console.log('✅ 主窗口已重新创建并显示');
                    }
                } catch (recreateError) {
                    console.error('❌ 重新创建主窗口也失败:', recreateError);
                }
            }
        });

        console.log('系统托盘已创建');

    } catch (error) {
        console.error('创建系统托盘失败:', error);
    }
}

// 获取真实股票数据（东方财富API）
async function fetchRealStockData() {
    try {
        // console.log('正在获取东方财富实时股票数据...');

        // 构建股票代码字符串（东方财富格式）
        const stockString = stockCodes.map(code => {
            // 根据股票代码前缀判断市场
            if (code.startsWith('6')) {
                return `1.${code}`; // 上海市场
            } else if (code.startsWith('0') && code.length === 5) {
                return `116.${code}`; // 香港市场
            } else {
                return `0.${code}`; // 深圳市场
            }
        }).join(',');

        const url = `http://push2.eastmoney.com/api/qt/ulist.np/get?secids=${stockString}&fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152`;

        // console.log('请求URL:', url);

        // 根据URL协议选择HTTP或HTTPS模块
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const httpModule = isHttps ? https : http;

        // 使用Promise包装HTTP请求
        const data = await new Promise((resolve, reject) => {
            httpModule.get(url, (res) => {
                let rawData = '';

                res.on('data', (chunk) => {
                    rawData += chunk;
                });

                res.on('end', () => {
                    resolve(rawData);
                });
            }).on('error', (err) => {
                reject(err);
            });
        });

        // 解析东方财富数据
        const stockDataArray = parseEastMoneyStockData(data);

        // 更新股票数据
        stockData.clear();
        stockDataArray.forEach(stock => {
            if (stock && stock.code) {
                stockData.set(stock.code, stock);
            }
        });

        // 立即更新托盘显示
        updateTrayDisplay();

        // 通知渲染进程更新数据
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('stock-data-updated', Array.from(stockData.values()));
        }

        // console.log('东方财富股票数据已更新:', new Date().toLocaleString());
        // console.log('获取到股票数量:', stockData.size);

    } catch (error) {
        console.error('获取东方财富股票数据失败:', error);
        // 如果真实数据获取失败，使用模拟数据作为备用
        console.log('使用模拟数据作为备用...');
        generateMockStockData();
    }
}

// 解析东方财富股票数据
function parseEastMoneyStockData(rawData) {
    try {
        const jsonData = JSON.parse(rawData);
        const stocks = [];

        if (jsonData.data && jsonData.data.diff) {
            jsonData.data.diff.forEach(item => {
                try {
                    // 东方财富数据字段说明：
                    // f2: 最新价, f3: 涨跌幅, f4: 涨跌额, f5: 成交量, f6: 成交额
                    // f7: 振幅, f8: 最高, f9: 最低, f10: 今开, f11: 昨收
                    // f12: 代码, f14: 名称, f15: 最高, f16: 最低, f17: 今开, f18: 昨收
                    // f20: 总市值, f21: 流通市值, f23: 换手率, f24: 市盈率, f25: 市净率
                    // f26: 总股本, f33: 涨跌幅, f62: 主力净流入, f128: 涨跌额
                    // f136: 涨跌幅, f152: 涨跌额

                    const code = item.f12; // 股票代码
                    const name = item.f14; // 股票名称

                    // 判断是否为港股（5位代码，以0开头）
                    const isHKStock = code.length === 5 && code.startsWith('0');

                    // 港股价格需要除以1000，A股价格除以100
                    const priceDivisor = isHKStock ? 1000 : 100;

                    const currentPrice = item.f2 / priceDivisor; // 最新价
                    const previousPrice = item.f18 / priceDivisor; // 昨收价
                    const openPrice = item.f17 / priceDivisor; // 今开价
                    const highPrice = item.f15 / priceDivisor; // 最高价
                    const lowPrice = item.f16 / priceDivisor; // 最低价
                    const volume = item.f5; // 成交量
                    const amount = item.f6; // 成交额
                    const changePercent = item.f3 / 100; // 涨跌幅（除以100）
                    const priceChange = item.f4 / priceDivisor; // 涨跌额

                    // 计算涨跌额（如果API没有提供）
                    let finalPriceChange = priceChange;
                    if (finalPriceChange === 0) {
                        finalPriceChange = currentPrice - previousPrice;
                    }

                    // 计算涨跌幅（如果API没有提供）
                    let finalChangePercent = changePercent;
                    if (finalChangePercent === 0 && previousPrice > 0) {
                        finalChangePercent = (finalPriceChange / previousPrice) * 100;
                    }

                    const stock = {
                        code: code,
                        name: name,
                        price: parseFloat(currentPrice.toFixed(isHKStock ? 3 : 2)),
                        change: parseFloat(finalPriceChange.toFixed(isHKStock ? 3 : 2)),
                        changePercent: parseFloat(finalChangePercent.toFixed(2)),
                        volume: volume,
                        amount: amount,
                        timestamp: new Date()
                    };

                    stocks.push(stock);
                    console.log(`解析数据: ${code} ${name} ¥${currentPrice.toFixed(isHKStock ? 3 : 2)} ${finalPriceChange >= 0 ? '↗' : '↘'}${Math.abs(finalPriceChange).toFixed(isHKStock ? 3 : 2)} (${finalChangePercent.toFixed(2)}%)`);

                } catch (parseError) {
                    console.log('解析单个股票数据失败:', parseError.message);
                }
            });
        }

        return stocks;

    } catch (parseError) {
        console.log('解析东方财富JSON数据失败:', parseError.message);
        return [];
    }
}

// 获取股票名称的拼音首字母缩写
function getStockNameAbbr(chineseName) {
    // 首先查找预定义的映射
    if (chineseToPinyinMap[chineseName]) {
        return chineseToPinyinMap[chineseName];
    }

    // 如果没有预定义映射，返回null，让调用方处理
    return null;
}

// 生成模拟股票数据（备用）
function generateMockStockData() {
    const stockNames = {
        '000001': '平安银行',
        '600000': '浦发银行',
        '000858': '五粮液',
        '000002': '万科A',
        '600036': '招商银行',
        '600519': '贵州茅台',
        '00001': '长江实业',
        '00700': '腾讯控股',
        '00941': '中国移动',
        '02318': '中国平安'
    };

    const mockData = stockCodes.map(code => {
        // 判断是否为港股
        const isHKStock = code.length === 5 && code.startsWith('0');

        // 港股使用更高的基础价格和更小的变化幅度
        const basePrice = isHKStock ?
            (50 + Math.random() * 150) : // 港股基础价格50-200
            (10 + Math.random() * 90);   // A股基础价格10-100

        const change = isHKStock ?
            (Math.random() - 0.5) * 0.02 : // 港股±1%变化
            (Math.random() - 0.5) * 0.1;   // A股±5%变化

        const currentPrice = basePrice * (1 + change);
        const previousPrice = basePrice;
        const priceChange = currentPrice - previousPrice;
        const changePercent = (priceChange / previousPrice) * 100;

        return {
            code: code,
            name: stockNames[code] || `股票${code}`,
            price: parseFloat(currentPrice.toFixed(isHKStock ? 3 : 2)),
            change: parseFloat(priceChange.toFixed(isHKStock ? 3 : 2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            volume: Math.floor(Math.random() * 1000000) + 100000,
            timestamp: new Date()
        };
    });

    // 更新股票数据
    stockData.clear();
    mockData.forEach(stock => {
        stockData.set(stock.code, stock);
    });

    // 立即更新托盘显示
    updateTrayDisplay();

    // 通知渲染进程更新数据
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('stock-data-updated', Array.from(stockData.values()));
    }

    console.log('模拟股票数据已生成，已通知渲染进程');
}

// 更新托盘显示
function updateTrayDisplay() {
    if (stockData.size === 0 || !tray) return;

    try {
        const stockArray = Array.from(stockData.values());
        const currentStock = stockArray[currentStockIndex];

        if (currentStock) {
            // 判断是否为港股
            const isHKStock = currentStock.code.length === 5 && currentStock.code.startsWith('0');

            // 构建显示文本
            const changeSymbol = parseFloat(currentStock.change) >= 0 ? '↗' : '↘';
            const changeColor = parseFloat(currentStock.change) >= 0 ? '🟢' : '🔴';

            // 获取股票名称的拼音首字母缩写
            let nameAbbr = getStockNameAbbr(currentStock.name);

            // 如果没有找到拼音缩写，使用股票代码后3位
            if (!nameAbbr) {
                if (isHKStock) {
                    nameAbbr = currentStock.code.slice(-3); // 港股显示后3位
                } else {
                    nameAbbr = currentStock.code.slice(-3); // A股显示后3位
                }
            }

            // 托盘提示文本
            const tooltipText = `${changeColor} ${currentStock.code} ${currentStock.name}(${nameAbbr})\n¥${currentStock.price.toFixed(isHKStock ? 3 : 2)} ${changeSymbol}${currentStock.change.toFixed(isHKStock ? 3 : 2)} (${currentStock.changePercent}%)`;

            // 更新托盘提示
            tray.setToolTip(tooltipText);

            //console.log(`托盘显示: ${currentStock.code} ${currentStock.price.toFixed(isHKStock ? 3 : 2)} ${changeSymbol}${currentStock.change.toFixed(isHKStock ? 3 : 2)}`);
        }

        // 移动到下一个股票
        currentStockIndex = (currentStockIndex + 1) % stockArray.length;

    } catch (error) {
        console.error('更新托盘显示失败:', error);
    }
}

// 启动股票轮播显示
function startStockRotation() {
    if (stockDisplayTimer) {
        clearInterval(stockDisplayTimer);
    }

    // 使用配置的间隔时间轮播显示股票
    stockDisplayTimer = setInterval(() => {
        updateTrayDisplay();
        updateFloatingDisplay(); // 同时更新悬浮窗口
    }, stockDisplayInterval);

    console.log(`股票轮播显示已启动，每${stockDisplayInterval / 1000}秒切换一次`);
}

// 启动数据刷新定时器
function startDataRefresh() {
    if (dataRefreshTimer) {
        clearInterval(dataRefreshTimer);
    }

    // 使用配置的间隔时间刷新真实数据
    dataRefreshTimer = setInterval(() => {
        fetchRealStockData();
    }, dataRefreshInterval);

    console.log(`数据刷新定时器已启动，每${dataRefreshInterval / 1000}秒刷新一次`);
}

// 停止股票轮播显示
function stopStockRotation() {
    if (stockDisplayTimer) {
        clearInterval(stockDisplayTimer);
        stockDisplayTimer = null;
    }
}

// 停止数据刷新定时器
function stopDataRefresh() {
    if (dataRefreshTimer) {
        clearInterval(dataRefreshTimer);
        dataRefreshTimer = null;
    }
}

// 设置IPC处理程序
function setupIpcHandlers() {
    // 处理获取股票数据请求
    ipcMain.handle('get-stock-data', async () => {
        return Array.from(stockData.values());
    });

    // 处理获取设置请求
    ipcMain.handle('get-settings', async () => {
        return {
            stockCodes: stockCodes,
            timers: {
                stockDisplayInterval: stockDisplayInterval,
                dataRefreshInterval: dataRefreshInterval
            }
        };
    });

    // 处理更新设置请求
    ipcMain.handle('update-settings', async (event, settings) => {
        let needsRestartTimers = false;

        if (settings.stockCodes) {
            stockCodes = settings.stockCodes;
            console.log('股票代码已更新:', stockCodes);
            needsRestartTimers = true;
        }

        if (settings.timers) {
            if (settings.timers.stockDisplayInterval && settings.timers.stockDisplayInterval !== stockDisplayInterval) {
                stockDisplayInterval = settings.timers.stockDisplayInterval;
                console.log('股票显示轮播间隔已更新:', stockDisplayInterval, '毫秒');
                needsRestartTimers = true;
            }

            if (settings.timers.dataRefreshInterval && settings.timers.dataRefreshInterval !== dataRefreshInterval) {
                dataRefreshInterval = settings.timers.dataRefreshInterval;
                console.log('数据刷新间隔已更新:', dataRefreshInterval, '毫秒');
                needsRestartTimers = true;
            }
        }

        if (needsRestartTimers) {
            // 保存到配置文件
            saveStockCodes();

            // 重启定时器以应用新配置
            startStockRotation();
            startDataRefresh();

            // 更新设置后立即获取新数据
            fetchRealStockData();
        }

        return { success: true };
    });

    // 处理手动刷新数据请求
    ipcMain.handle('refresh-stock-data', async () => {
        await fetchRealStockData();
        return { success: true };
    });

    // 处理获取股票数据请求（兼容旧版本）
    ipcMain.handle('fetch-stock-data', async () => {
        return Array.from(stockData.values());
    });

    // 处理隐藏悬浮窗口请求
    ipcMain.handle('hide-floating-window', async () => {
        hideFloatingWindow();
        return { success: true };
    });

    // 处理显示主窗口请求
    ipcMain.handle('show-main-window', async () => {
        try {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.show();
                mainWindow.focus();
                mainWindow.restore(); // 确保窗口从最小化状态恢复
                hideFloatingWindow();
            } else {
                console.warn('⚠️ 主窗口不存在或已销毁，重新创建');
                createWindow();
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.show();
                    mainWindow.focus();
                    mainWindow.restore();
                    hideFloatingWindow();
                    console.log('✅ 主窗口已重新创建并显示');
                }
            }
        } catch (error) {
            console.error('显示主窗口失败:', error);
            // 尝试重新创建主窗口
            try {
                createWindow();
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.show();
                    mainWindow.focus();
                    console.log('✅ 主窗口已重新创建并显示');
                }
            } catch (recreateError) {
                console.error('❌ 重新创建主窗口也失败:', recreateError);
            }
        }
        return { success: true };
    });

    // 处理隐藏主窗口请求
    ipcMain.handle('hide-main-window', async () => {
        try {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.hide();
                showFloatingWindow();
            }
        } catch (error) {
            console.error('隐藏主窗口失败:', error);
        }
        return { success: true };
    });

    console.log('IPC处理程序已设置');
}

// 检查并恢复窗口状态
function checkAndRestoreWindows() {
    try {
        // 检查主窗口
        if (!mainWindow || mainWindow.isDestroyed()) {
            console.warn('⚠️ 主窗口不存在或已销毁，重新创建');
            // createWindow();
        } else if (!mainWindow.isVisible() && !mainWindow.isMinimized()) {
            console.warn('⚠️ 主窗口不可见且未最小化，尝试恢复');
            // mainWindow.show();
            //mainWindow.focus();
        }

        // 检查悬浮窗口
        if (!floatingWindow || floatingWindow.isDestroyed()) {
            console.warn('⚠️ 悬浮窗口不存在或已销毁，重新创建');
            createFloatingWindow();
        }
    } catch (error) {
        console.error('❌ 检查并恢复窗口状态失败:', error);
    }
}

// 设置 Electron 启动参数，减少缓存错误
if (process.platform === 'win32') {
    // Windows 平台特定设置
    process.argv.push('--disable-gpu-cache');
    process.argv.push('--disable-software-rasterizer');
    process.argv.push('--disable-gpu-sandbox');
    process.argv.push('--no-sandbox');
    process.argv.push('--disable-dev-shm-usage');
    process.argv.push('--disable-web-security');
    process.argv.push('--allow-running-insecure-content');

    console.log('🔧 Windows 平台启动参数已设置');
}

// 全局错误处理
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    // 尝试恢复窗口状态
    setTimeout(checkAndRestoreWindows, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
    // 尝试恢复窗口状态
    setTimeout(checkAndRestoreWindows, 1000);
});

// 应用事件处理
app.whenReady().then(() => {
    console.log('应用已准备就绪，开始初始化...');

    // 设置缓存目录到执行目录，避免权限问题
    try {
        const cachePath = path.join(__dirname, 'cache');
        const userDataPath = path.join(__dirname, 'userData');

        // 设置应用缓存目录
        app.setPath('userData', userDataPath);
        app.setPath('temp', path.join(__dirname, 'temp'));
        app.setPath('logs', path.join(__dirname, 'logs'));

        console.log('✅ 缓存目录已设置到执行目录:');
        console.log('   - 用户数据目录:', userDataPath);
        console.log('   - 临时目录:', path.join(__dirname, 'temp'));
        console.log('   - 日志目录:', path.join(__dirname, 'logs'));

        // 确保目录存在
        [cachePath, userDataPath, path.join(__dirname, 'temp'), path.join(__dirname, 'logs')].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log('📁 创建目录:', dir);
            }
        });
    } catch (error) {
        console.warn('⚠️ 设置缓存目录失败，使用默认路径:', error.message);
    }

    // 验证必需的资源文件
    validateResourceFiles();

    // 首先加载股票代码配置
    loadStockCodes();

    // 加载股票名称配置
    loadStockNamesConfig();

    createWindow();
    createFloatingWindow(); // 创建悬浮窗口
    createTray();
    setupIpcHandlers();

    // 启动后立即获取真实股票数据
    setTimeout(() => {
        fetchRealStockData();
    }, 1000);

    // 启动数据刷新定时器
    startDataRefresh();

    // 启动股票轮播显示
    startStockRotation();

    // 定期检查窗口状态（每30秒检查一次）
    setInterval(checkAndRestoreWindows, 30000);
    //mainWindow.hide();
    floatingWindow.show();
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
    stopStockRotation();
    stopDataRefresh();

    // 清理悬浮窗口
    if (floatingWindow && !floatingWindow.isDestroyed()) {
        floatingWindow.destroy();
    }

    console.log('应用退出');
});
