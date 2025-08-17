class StockWidgetRenderer {
    constructor() {
        this.stockData = [];
        this.stockCodes = ['000001', '600000', '000858'];
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
        // 设置按钮事件
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                console.log('🎯 设置按钮被点击');
                this.toggleSettings();
            });
            console.log('✅ 设置按钮事件已绑定');
        } else {
            console.error('❌ 设置按钮不存在');
        }

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
            // ESC键关闭设置面板
            if (e.key === 'Escape' && this.isSettingsVisible) {
                this.toggleSettings();
            }
        });

        // 点击外部区域关闭设置面板
        document.addEventListener('click', (e) => {
            if (this.isSettingsVisible && !e.target.closest('#settings-panel') && !e.target.closest('#settings-btn')) {
                this.toggleSettings();
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
                    if (this.isSettingsVisible && stockInput) {
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

            // 监听打开设置面板
            window.electronAPI.on('open-settings', () => {
                this.toggleSettings();
            });

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
                this.refreshInterval = settings.refreshInterval || 30000;
                this.rotationInterval = settings.rotationInterval || 5000;
                this.stockCodes = settings.stockCodes || ['000001', '600000', '000858'];
                this.updateLastUpdateTime();
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
            }
        ];
        this.updateStockDisplay();
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

    // 切换设置面板
    toggleSettings() {
        console.log('🔄 切换设置面板...');
        const settingsPanel = document.getElementById('settings-panel');

        if (!settingsPanel) {
            console.error('❌ 设置面板不存在');
            return;
        }

        if (settingsPanel.classList.contains('hidden')) {
            // 强制显示样式
            settingsPanel.style.display = 'block';
            settingsPanel.style.visibility = 'visible';
            settingsPanel.style.opacity = '1';
            settingsPanel.style.position = 'relative';
            settingsPanel.style.zIndex = '1000';

            // 填充当前设置
            const refreshInput = document.getElementById('refresh-interval');
            const rotationInput = document.getElementById('rotation-interval');

            if (refreshInput) {
                refreshInput.value = this.refreshInterval / 1000;
            }
            if (rotationInput) {
                rotationInput.value = this.rotationInterval / 1000;
            }

            // 更新股票代码列表显示
            this.updateStockCodesList();

            // 强制刷新输入框状态
            this.forceRefreshInput();

            settingsPanel.classList.remove('hidden');
            this.isSettingsVisible = true;
            console.log('✅ 设置面板已显示');
        } else {
            settingsPanel.classList.add('hidden');
            settingsPanel.style.display = 'none';
            this.isSettingsVisible = false;
            console.log('✅ 设置面板已隐藏');
        }
    }

    // 更新股票代码列表显示
    updateStockCodesList() {
        const stockCodesList = document.getElementById('stock-codes-list');
        if (!stockCodesList) {
            console.error('❌ 股票代码列表不存在');
            return;
        }

        if (this.stockCodes.length === 0) {
            stockCodesList.innerHTML = `
                <div class="stock-codes-empty">
                    <i class="fas fa-plus-circle"></i>
                    <div>暂无股票代码，请添加</div>
                </div>
            `;
            return;
        }

        stockCodesList.innerHTML = this.stockCodes.map(code => this.createStockCodeItem(code)).join('');

        // 重新绑定事件
        this.bindStockCodeEvents();
    }

    // 创建股票代码项
    createStockCodeItem(code) {
        const stock = this.stockData.find(s => s.code === code);
        const name = stock ? stock.name : '未知股票';

        return `
            <div class="stock-code-item" data-code="${code}">
                <div class="stock-code-actions">
                    <button class="remove-stock-btn" title="删除股票" onclick="stockWidget.removeStockCode('${code}')">
                        <i class="fas fa-minus-circle"></i>
                    </button>
                </div>
                <div class="stock-code-info">
                    <span class="stock-code-text">${code}</span>
                    <span class="stock-code-name">${name}</span>
                </div>
            </div>
        `;
    }

    // 绑定股票代码事件
    bindStockCodeEvents() {
        // 编辑按钮事件已在HTML中通过onclick绑定
        // 删除按钮事件已在HTML中通过onclick绑定
    }

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
        this.updateStockCodesList();
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
            this.updateStockCodesList();
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
        return /^(0|3|6)\d{5}$/.test(code);
    }

    // 保存设置
    async saveSettings() {
        try {
            const refreshInterval = document.getElementById('refresh-interval');
            const rotationInterval = document.getElementById('rotation-interval');

            if (refreshInterval && rotationInterval) {
                this.refreshInterval = parseInt(refreshInterval.value) * 1000;
                this.rotationInterval = parseInt(rotationInterval.value) * 1000;
            }

            const settings = {
                refreshInterval: this.refreshInterval,
                rotationInterval: this.rotationInterval,
                stockCodes: this.stockCodes
            };

            if (window.electronAPI) {
                await window.electronAPI.invoke('update-settings', settings);
            }

            this.showNotification('设置已保存');

            // 重新启动定时器
            this.startDataRefresh();
            this.startStockRotation();

            // 保存设置后自动回到主界面
            setTimeout(() => {
                this.toggleSettings();
            }, 1000);

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

        stockList.innerHTML = this.stockData.map(stock => `
            <div class="stock-item">
                <div class="stock-header">
                    <div class="stock-code">${stock.code}</div>
                    <div class="stock-name">${stock.name}</div>
                </div>
                <div class="stock-price">¥${stock.price.toFixed(2)}</div>
                <div class="stock-change ${stock.change >= 0 ? 'positive' : 'negative'}">
                    ${stock.change >= 0 ? '↗' : '↘'}${Math.abs(stock.change).toFixed(2)} 
                    <span class="stock-percent">(${stock.change >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)</span>
                </div>
            </div>
        `).join('');
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
