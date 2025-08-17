class StockWidgetRenderer {
    constructor() {
        this.stockData = [];
        this.stockCodes = ['000001', '600000', '000858', '00001', '00700'];
        this.refreshInterval = 30000; // 30秒
        this.rotationInterval = 5000; // 5秒
        this.currentStockIndex = 0;
        this.lastUpdateTime = new Date();
        this.nextUpdateTime = new Date();
        this.isSettingsVisible = false; // 设置面板可见性状态

        // 等待DOM和API加载完成后再初始化
        this.waitForReady();
    }

    // 等待所有依赖准备就绪
    async waitForReady() {
        try {
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // 等待electronAPI加载完成
            let attempts = 0;
            const maxAttempts = 50; // 最多等待5秒

            while (!window.electronAPI && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }

            if (!window.electronAPI) {
                console.error('❌ electronAPI 加载超时，使用备用方案');
                this.initWithoutElectron();
                return;
            }

            console.log('✅ 所有依赖加载完成，开始初始化');
            this.init();

        } catch (error) {
            console.error('❌ 等待依赖加载失败:', error);
            this.initWithoutElectron();
        }
    }

    // 不使用Electron的备用初始化
    initWithoutElectron() {
        console.log('🔄 使用备用方案初始化...');
        this.bindEvents();
        this.loadMockData();
        this.startMockRefresh();
        // 股票代码列表功能已移除
    }

    // 正常初始化
    init() {
        try {
            this.bindEvents();
            this.setupIpcListeners();
            this.loadInitialData();
            this.startDataRefresh();
            this.startStockRotation();
            this.updateLastUpdateTime();
            // 股票代码列表功能已移除
        } catch (error) {
            console.error('初始化失败:', error);
            // 如果初始化失败，尝试备用方案
            this.initWithoutElectron();
        }
    }

    // 强制刷新输入框状态
    forceRefreshInput() {
        const stockInput = document.getElementById('new-stock-code');
        if (stockInput) {
            // 强制重置输入框状态
            stockInput.readOnly = false;
            stockInput.disabled = false;
            stockInput.style.pointerEvents = 'auto';
            stockInput.style.opacity = '1';
            stockInput.style.cursor = 'text';

            // 清空输入框内容
            stockInput.value = '';

            // 重新聚焦
            stockInput.focus();

            console.log('✅ 输入框状态已强制刷新');
        }
    }

    // 绑定事件
    bindEvents() {
        // 设置按钮事件已移除

        // 刷新按钮事件
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshStockData();
            });
        }

        // 最小化按钮事件
        const minimizeBtn = document.getElementById('minimize-btn');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                this.hideToTray();
            });
        }

        // 关闭按钮事件
        const closeBtn = document.getElementById('close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideWindow();
            });
        }

        // 窗口事件
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveSettings();
            }
        });

        // 股票代码输入框回车事件
        const stockInput = document.getElementById('new-stock-code');
        if (stockInput) {
            stockInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addStockCode();
                }
            });

            // 确保输入框始终可用
            stockInput.addEventListener('blur', () => {
                setTimeout(() => {
                    if (stockInput) {
                        // 强制刷新输入框状态
                        this.forceRefreshInput();
                    }
                }, 100);
            });

            // 添加输入框状态监控
            stockInput.addEventListener('input', () => {
                // 每次输入时确保输入框可用
                if (stockInput.readOnly || stockInput.disabled) {
                    this.forceRefreshInput();
                }
            });

            console.log('✅ 股票代码输入框回车事件已绑定');
        }
    }

    // 设置IPC监听器（安全版本）
    setupIpcListeners() {
        try {
            if (!window.electronAPI) {
                console.warn('⚠️ electronAPI 不可用，跳过IPC监听器设置');
                return;
            }

            // 监听股票数据更新
            window.electronAPI.on('stock-data-updated', (data) => {
                this.updateStockData(data);
            });

            // 设置面板相关监听器已移除

            console.log('✅ IPC监听器设置完成');
        } catch (error) {
            console.error('❌ 设置IPC监听器失败:', error);
        }
    }

    // 加载初始数据（安全版本）
    async loadInitialData() {
        try {
            if (!window.electronAPI) {
                console.warn('⚠️ electronAPI 不可用，使用默认数据');
                this.loadMockData();
                this.startMockRefresh();
                return;
            }

            const data = await window.electronAPI.invoke('get-stock-data');
            if (data && data.length > 0) {
                this.updateStockData(data);
                console.log('✅ 从主进程获取到股票数据:', data.length, '个');
            } else {
                console.log('⚠️ 主进程股票数据为空，使用模拟数据');
                this.loadMockData();
                this.startMockRefresh();
            }

            const settings = await window.electronAPI.invoke('get-settings');
            if (settings) {
                this.stockCodes = settings.stockCodes || ['000001', '600000', '000858'];
                this.updateLastUpdateTime();
                // 股票代码列表功能已移除
            }
        } catch (error) {
            console.error('加载初始数据失败:', error);
            // 使用默认数据
            this.loadMockData();
            this.startMockRefresh();
        }
    }

    // 加载模拟数据
    loadMockData() {
        this.stockData = [
            {
                code: '000001',
                name: '平安银行',
                price: 12.08,
                change: -0.12,
                changePercent: -0.98
            },
            {
                code: '600000',
                name: '浦发银行',
                price: 13.59,
                change: -0.28,
                changePercent: -2.02
            },
            {
                code: '000858',
                name: '五粮液',
                price: 123.10,
                change: 0.26,
                changePercent: 0.21
            },
            {
                code: '00001',
                name: '长江实业',
                price: 45.20,
                change: 0.85,
                changePercent: 1.92
            },
            {
                code: '00700',
                name: '腾讯控股',
                price: 320.80,
                change: -2.40,
                changePercent: -0.74
            }
        ];
        this.updateStockDisplay();
        // 股票代码列表功能已移除
    }

    // 开始模拟数据刷新
    startMockRefresh() {
        if (this.mockRefreshTimer) {
            clearInterval(this.mockRefreshTimer);
        }

        this.mockRefreshTimer = setInterval(() => {
            this.updateMockData();
        }, this.refreshInterval);

        console.log('✅ 模拟数据刷新已启动，间隔:', this.refreshInterval / 1000, '秒');
    }

    // 更新模拟数据
    updateMockData() {
        this.stockData.forEach(stock => {
            // 模拟价格波动（更明显的变化）
            const change = (Math.random() - 0.5) * 0.5; // 增加波动幅度
            stock.price = Math.max(0.01, stock.price + change);
            stock.change = change;
            stock.changePercent = (change / (stock.price - change)) * 100;
        });
        this.updateStockDisplay();
        this.updateLastUpdateTime();
        console.log('🔄 模拟数据已更新');
    }

    // 隐藏到托盘
    hideToTray() {
        this.showTrayNotification('应用已最小化到系统托盘，点击托盘图标可重新显示');
        // 主进程会处理窗口隐藏
    }

    // 隐藏窗口
    hideWindow() {
        try {
            if (window.electronAPI) {
                window.electronAPI.invoke('hide-main-window');
            } else {
                console.log('🔄 使用备用隐藏方案');
                // 备用方案：最小化窗口
                if (window.electron && window.electron.getCurrentWindow) {
                    window.electron.getCurrentWindow().minimize();
                }
            }
        } catch (error) {
            console.error('隐藏窗口失败:', error);
        }
    }

    // 显示托盘通知
    showTrayNotification(message) {
        const notification = document.getElementById('tray-notification');
        const text = document.getElementById('notification-text');

        if (notification && text) {
            text.textContent = message;
            notification.classList.remove('hidden');

            setTimeout(() => {
                notification.classList.add('hidden');
            }, 3000);
        } else {
            // 备用通知方案
            console.log('📢 通知:', message);
        }
    }

    // 股票代码列表功能已移除，删除按钮直接集成在股票显示中

    // 添加股票代码
    addStockCode() {
        const input = document.getElementById('new-stock-code');
        if (!input) {
            console.error('❌ 新股票代码输入框不存在');
            return;
        }

        const code = input.value.trim();

        if (!code) {
            alert('请输入股票代码');
            // 确保输入框可以继续输入
            input.focus();
            return;
        }

        if (!this.isValidStockCode(code)) {
            alert('股票代码格式不正确');
            // 清空输入框并重新聚焦，确保可以继续输入
            input.value = '';
            input.focus();
            return;
        }

        if (this.stockCodes.includes(code)) {
            alert('股票代码已存在');
            // 清空输入框并重新聚焦，确保可以继续输入
            input.value = '';
            input.focus();
            return;
        }

        // 添加到股票代码列表
        this.stockCodes.push(code);

        // 添加到股票数据（如果不存在）
        if (!this.stockData.find(s => s.code === code)) {
            this.stockData.push({
                code: code,
                name: '新股票',
                price: 0.00,
                change: 0.00,
                changePercent: 0.00
            });
        }

        // 更新显示
        this.updateStockDisplay();

        // 清空输入框
        input.value = '';

        // 保存设置
        this.saveSettings();

        this.showNotification(`股票代码 ${code} 已添加`);

        // 延迟重新聚焦到输入框，确保DOM更新完成
        setTimeout(() => {
            input.focus();
        }, 50);
    }

    // 编辑股票代码（已移除，改为只支持删除）
    editStockCode(button) {
        console.log('⚠️ 编辑功能已移除，请使用删除后重新添加的方式');
    }

    // 保存股票代码编辑（已移除）
    saveStockCodeEdit(button, originalCode) {
        console.log('⚠️ 编辑功能已移除');
    }

    // 取消股票代码编辑（已移除）
    cancelStockCodeEdit(button, originalCode) {
        console.log('⚠️ 编辑功能已移除');
    }

    // 删除股票代码
    removeStockCode(code) {
        if (confirm(`确定要删除股票代码 ${code} 吗？`)) {
            // 从股票代码列表中删除
            const codeIndex = this.stockCodes.indexOf(code);
            if (codeIndex !== -1) {
                this.stockCodes.splice(codeIndex, 1);
            }

            // 从股票数据中删除
            const dataIndex = this.stockData.findIndex(s => s.code === code);
            if (dataIndex !== -1) {
                this.stockData.splice(dataIndex, 1);
            }

            // 更新显示
            this.updateStockDisplay();

            // 保存设置
            this.saveSettings();

            this.showNotification(`股票代码 ${code} 已删除`);
        }
    }

    // 删除股票代码（兼容旧版本）
    deleteStockCode(button) {
        const item = button.closest('.stock-code-item');
        const code = item.dataset.code;
        this.removeStockCode(code);
    }

    // 验证股票代码格式
    isValidStockCode(code) {
        // 支持：
        // 000001-000999: 深市主板
        // 002001-002999: 深市中小板  
        // 300001-300999: 深市创业板
        // 600001-600999: 沪市主板
        // 688001-688999: 沪市科创板
        // 00001-09999: 香港主板
        return /^(0|3|6)\d{5}$|^0\d{4}$/.test(code);
    }

    // 保存设置
    async saveSettings() {
        try {
            const settings = {
                stockCodes: this.stockCodes
            };

            if (window.electronAPI) {
                await window.electronAPI.invoke('update-settings', settings);
            }

            this.showNotification('股票代码已保存');

        } catch (error) {
            console.error('保存设置失败:', error);
            this.showNotification('保存设置失败');
        }
    }

    // 显示通知
    showNotification(message) {
        console.log('📢 通知:', message);
        // 可以在这里添加更友好的通知显示
    }

    // 刷新股票数据
    async refreshStockData() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.invoke('refresh-stock-data');
            } else {
                // 备用方案：更新模拟数据
                this.updateMockData();
            }
        } catch (error) {
            console.error('刷新股票数据失败:', error);
        }
    }

    // 更新股票数据
    updateStockData(data) {
        if (data && Array.isArray(data)) {
            this.stockData = data;
            this.updateStockDisplay();
            this.updateLastUpdateTime();
        }
    }

    // 更新股票显示
    updateStockDisplay() {
        const stockList = document.getElementById('stock-list');
        if (!stockList) return;

        stockList.innerHTML = this.stockData.map(stock => {
            // 判断是否为港股（5位代码，以0开头）
            const isHKStock = stock.code.length === 5 && stock.code.startsWith('0');

            // 根据股票类型格式化价格
            const priceDisplay = isHKStock ?
                stock.price.toFixed(3) : // 港股显示3位小数
                stock.price.toFixed(2);  // A股显示2位小数

            return `
                <div class="stock-item" data-code="${stock.code}">
                    <div class="stock-header">
                        <div class="stock-code">${stock.code}</div>
                        <div class="stock-name">
                            ${stock.name}
                            <button class="stock-delete-btn" title="删除股票" onclick="stockWidget.removeStockCode('${stock.code}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="stock-price">¥${priceDisplay}</div>
                    <div class="stock-change ${stock.change >= 0 ? 'positive' : 'negative'}">
                        ${stock.change >= 0 ? '↗' : '↘'}${Math.abs(stock.change).toFixed(isHKStock ? 3 : 2)} 
                        <span class="stock-percent">(${stock.change >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 开始数据刷新
    startDataRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }

        this.refreshTimer = setInterval(() => {
            this.refreshStockData();
        }, this.refreshInterval);
    }

    // 开始股票轮播
    startStockRotation() {
        if (this.rotationTimer) {
            clearInterval(this.rotationTimer);
        }

        this.rotationTimer = setInterval(() => {
            this.rotateStockDisplay();
        }, this.rotationInterval);
    }

    // 轮播股票显示
    rotateStockDisplay() {
        if (this.stockData.length === 0) return;

        this.currentStockIndex = (this.currentStockIndex + 1) % this.stockData.length;
        this.updateStockDisplay();
    }

    // 更新最后更新时间
    updateLastUpdateTime() {
        const lastUpdateElement = document.getElementById('last-update');
        const nextUpdateElement = document.getElementById('next-update');

        if (lastUpdateElement) {
            this.lastUpdateTime = new Date();
            lastUpdateElement.textContent = `最后更新: ${this.lastUpdateTime.toLocaleTimeString()}`;
        }

        if (nextUpdateElement) {
            this.nextUpdateTime = new Date(this.lastUpdateTime.getTime() + this.refreshInterval);
            nextUpdateElement.textContent = `下次更新: ${this.nextUpdateTime.toLocaleTimeString()}`;
        }
    }

    // 清理资源
    cleanup() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        if (this.rotationTimer) {
            clearInterval(this.rotationTimer);
        }
        if (this.mockRefreshTimer) {
            clearInterval(this.mockRefreshTimer);
        }
    }
}

// 创建全局实例
let stockWidget;

// 等待DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 开始初始化股票小工具...');
    stockWidget = new StockWidgetRenderer();
});

// 备用初始化方案
if (document.readyState === 'complete') {
    console.log('🚀 DOM已加载完成，直接初始化...');
    stockWidget = new StockWidgetRenderer();
}
