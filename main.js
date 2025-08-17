const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, screen } = require('electron');
const path = require('path');
const https = require('https');
const http = require('http');

let mainWindow;
let floatingWindow; // 悬浮窗口
let tray;
let stockData = new Map();
let stockCodes = ['000001', '600000', '000858']; // 默认股票代码
let currentStockIndex = 0; // 当前显示的股票索引
let stockDisplayTimer = null; // 股票显示轮播定时器
let dataRefreshTimer = null; // 数据刷新定时器

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
        show: false, // 窗口隐藏，只显示托盘
        resizable: false,
        minimizable: true, // 允许最小化
        maximizable: false,
        skipTaskbar: false,
        alwaysOnTop: false
    });

    console.log('主窗口已创建，正在加载HTML文件...');
    mainWindow.loadFile('index.html');

    // 设置任务栏标题
    mainWindow.setTitle('股票行情小工具');

    // 监听窗口最小化事件
    mainWindow.on('minimize', () => {
        console.log('主窗口已最小化，显示悬浮窗口');
        showFloatingWindow();
    });

    // 监听窗口恢复事件
    mainWindow.on('restore', () => {
        console.log('主窗口已恢复，隐藏悬浮窗口');
        hideFloatingWindow();
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
    const floatingX = width - floatingWidth - 20; // 右下角，距离右边缘20px
    const floatingY = height - floatingHeight; // 紧贴任务栏上方

    floatingWindow = new BrowserWindow({
        width: floatingWidth,
        height: floatingHeight,
        x: floatingX,
        y: floatingY,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            enableRemoteModule: false,
            webSecurity: true,
            allowRunningInsecureContent: false
        },
        icon: path.join(__dirname, 'assets/icon.png'),
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
    floatingWindow.loadFile('floating.html');

    // 设置窗口属性
    floatingWindow.setIgnoreMouseEvents(false, { forward: true });
    floatingWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

    // 强制设置置顶
    floatingWindow.setAlwaysOnTop(true, 'screen-saver');
    floatingWindow.setAlwaysOnTop(true, 'floating');

    // 监听窗口大小变化
    floatingWindow.on('resize', () => {
        const [newWidth, newHeight] = floatingWindow.getSize();
        console.log(`悬浮窗口大小已调整: ${newWidth}x${newHeight}`);

        // 保存新的尺寸到本地存储（可选）
        // 这里可以添加保存用户偏好尺寸的逻辑
    });

    // 监听窗口位置变化
    floatingWindow.on('moved', () => {
        const [newX, newY] = floatingWindow.getPosition();
        console.log(`悬浮窗口位置已调整: ${newX}, ${newY}`);

        // 保存新的位置到本地存储（可选）
        // 这里可以添加保存用户偏好位置的逻辑
    });

    // 确保窗口始终置顶
    floatingWindow.on('show', () => {
        floatingWindow.setAlwaysOnTop(true, 'screen-saver');
        floatingWindow.setSize(150, 30);
        floatingWindow.setAlwaysOnTop(true, 'floating');
    });

    // 监听窗口大小变化
    floatingWindow.on('resize', () => {
        const [newWidth, newHeight] = floatingWindow.getSize();
        console.log(`悬浮窗口大小已调整: ${newWidth}x${newHeight}`);

        // 保存新的尺寸到本地存储（可选）
        // 这里可以添加保存用户偏好尺寸的逻辑
    });

    // 监听窗口位置变化
    floatingWindow.on('moved', () => {
        const [newX, newY] = floatingWindow.getPosition();
        console.log(`悬浮窗口位置已调整: ${newX}, ${newY}`);

        // 保存新的位置到本地存储（可选）
        // 这里可以添加保存用户偏好位置的逻辑
    });

    // 确保窗口始终置顶
    floatingWindow.on('show', () => {
        floatingWindow.setAlwaysOnTop(true, 'screen-saver');
        floatingWindow.setAlwaysOnTop(true, 'floating');
    });

    console.log('悬浮窗口已创建');
}

// 显示悬浮窗口
function showFloatingWindow() {
    if (floatingWindow && !floatingWindow.isDestroyed()) {
        floatingWindow.show();
        console.log('悬浮窗口已显示');
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
            // 构建显示文本
            const changeSymbol = parseFloat(currentStock.change) >= 0 ? '↗' : '↘';
            const changeColor = parseFloat(currentStock.change) >= 0 ? '🟢' : '🔴';

            // 发送数据到悬浮窗口
            floatingWindow.webContents.send('update-stock-display', {
                code: currentStock.code.slice(-3),
                name: currentStock.name,
                currentPrice: currentStock.currentPrice,
                change: currentStock.change,
                changePercent: currentStock.changePercent,
                changeSymbol: changeSymbol,
                changeColor: changeColor
            });

            console.log(`悬浮窗口显示: ${currentStock.code} ${currentStock.currentPrice} ${changeSymbol}${currentStock.change}`);
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
        const iconPath = path.join(__dirname, 'assets/icon.png');
        let icon = nativeImage.createFromPath(iconPath);

        // 根据平台调整图标大小和设置
        if (process.platform === 'darwin') {
            // macOS: 状态栏图标需要特殊处理
            // 首先尝试加载@2x版本（如果存在）
            const icon2xPath = path.join(__dirname, 'assets/icon@2x.png');
            const icon3xPath = path.join(__dirname, 'assets/icon@3x.png');

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
                    mainWindow.show();
                    mainWindow.focus();
                    hideFloatingWindow();
                }
            },
            {
                label: '隐藏窗口',
                click: () => {
                    mainWindow.hide();
                    showFloatingWindow();
                }
            },
            { type: 'separator' },
            {
                label: '刷新东方财富数据',
                click: () => {
                    fetchRealStockData();
                }
            },
            { type: 'separator' },
            {
                label: '退出',
                click: () => {
                    app.quit();
                }
            }
        ]);

        // 设置托盘菜单
        tray.setContextMenu(contextMenu);

        // 托盘点击事件
        tray.on('click', () => {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
                showFloatingWindow();
            } else {
                mainWindow.show();
                mainWindow.focus();
                hideFloatingWindow();
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
        console.log('正在获取东方财富实时股票数据...');

        // 构建股票代码字符串（东方财富格式）
        const stockString = stockCodes.map(code => {
            // 根据股票代码前缀判断市场
            if (code.startsWith('6')) {
                return `1.${code}`; // 上海市场
            } else {
                return `0.${code}`; // 深圳市场
            }
        }).join(',');

        const url = `http://push2.eastmoney.com/api/qt/ulist.np/get?secids=${stockString}&fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152`;

        console.log('请求URL:', url);

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

        console.log('东方财富股票数据已更新:', new Date().toLocaleString());
        console.log('获取到股票数量:', stockData.size);

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
                    const currentPrice = item.f2 / 100; // 最新价（除以100）
                    const previousPrice = item.f18 / 100; // 昨收价（除以100）
                    const openPrice = item.f17 / 100; // 今开价（除以100）
                    const highPrice = item.f15 / 100; // 最高价（除以100）
                    const lowPrice = item.f16 / 100; // 最低价（除以100）
                    const volume = item.f5; // 成交量
                    const amount = item.f6; // 成交额
                    const changePercent = item.f3 / 100; // 涨跌幅（除以100）
                    const priceChange = item.f4 / 100; // 涨跌额（除以100）

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
                        currentPrice: currentPrice.toFixed(2),
                        previousPrice: previousPrice.toFixed(2),
                        openPrice: openPrice.toFixed(2),
                        highPrice: highPrice.toFixed(2),
                        lowPrice: lowPrice.toFixed(2),
                        change: finalPriceChange.toFixed(2),
                        changePercent: finalChangePercent.toFixed(2),
                        volume: volume,
                        amount: amount,
                        timestamp: new Date()
                    };

                    stocks.push(stock);
                    console.log(`解析股票数据: ${code} ${name} ¥${currentPrice.toFixed(2)} ${finalPriceChange >= 0 ? '↗' : '↘'}${Math.abs(finalPriceChange).toFixed(2)} (${finalChangePercent.toFixed(2)}%)`);

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

// 生成模拟股票数据（备用）
function generateMockStockData() {
    const stockNames = {
        '000001': '平安银行',
        '600000': '浦发银行',
        '000858': '五粮液',
        '000002': '万科A',
        '600036': '招商银行',
        '600519': '贵州茅台'
    };

    const mockData = stockCodes.map(code => {
        const basePrice = 10 + Math.random() * 90;
        const change = (Math.random() - 0.5) * 0.1; // ±5% 变化
        const currentPrice = basePrice * (1 + change);
        const previousPrice = basePrice;
        const priceChange = currentPrice - previousPrice;
        const changePercent = (priceChange / previousPrice) * 100;

        return {
            code: code,
            name: stockNames[code] || `股票${code}`,
            currentPrice: currentPrice.toFixed(2),
            previousPrice: previousPrice.toFixed(2),
            change: priceChange.toFixed(2),
            changePercent: changePercent.toFixed(2),
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

    console.log('模拟股票数据已生成');
}

// 更新托盘显示
function updateTrayDisplay() {
    if (stockData.size === 0 || !tray) return;

    try {
        const stockArray = Array.from(stockData.values());
        const currentStock = stockArray[currentStockIndex];

        if (currentStock) {
            // 构建显示文本
            const changeSymbol = parseFloat(currentStock.change) >= 0 ? '↗' : '↘';
            const changeColor = parseFloat(currentStock.change) >= 0 ? '🟢' : '🔴';

            // 托盘提示文本
            const tooltipText = `${changeColor} ${currentStock.code} ${currentStock.name}\n¥${currentStock.currentPrice} ${changeSymbol}${currentStock.change} (${currentStock.changePercent}%)`;

            // 更新托盘提示
            tray.setToolTip(tooltipText);

            console.log(`托盘显示: ${currentStock.code} ${currentStock.currentPrice} ${changeSymbol}${currentStock.change}`);
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

    // 每3秒轮播显示一个股票
    stockDisplayTimer = setInterval(() => {
        updateTrayDisplay();
        updateFloatingDisplay(); // 同时更新悬浮窗口
    }, 3000);

    console.log('股票轮播显示已启动，每3秒切换一次');
}

// 启动数据刷新定时器
function startDataRefresh() {
    if (dataRefreshTimer) {
        clearInterval(dataRefreshTimer);
    }

    // 每30秒刷新一次真实数据
    dataRefreshTimer = setInterval(() => {
        fetchRealStockData();
    }, 30000);

    console.log('数据刷新定时器已启动，每30秒刷新一次');
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
            refreshInterval: 30000,
            rotationInterval: 3000
        };
    });

    // 处理更新设置请求
    ipcMain.handle('update-settings', async (event, settings) => {
        if (settings.stockCodes) {
            stockCodes = settings.stockCodes;
            console.log('股票代码已更新:', stockCodes);
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
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.show();
            mainWindow.focus();
            hideFloatingWindow();
        }
        return { success: true };
    });

    // 处理隐藏主窗口请求
    ipcMain.handle('hide-main-window', async () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.hide();
            showFloatingWindow();
        }
        return { success: true };
    });

    console.log('IPC处理程序已设置');
}

// 应用事件处理
app.whenReady().then(() => {
    console.log('应用已准备就绪，开始初始化...');

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
