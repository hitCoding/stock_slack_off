// 渲染进程主类
class StockWidgetRenderer {
    constructor() {
        this.stockData = new Map();
        this.refreshInterval = 30000;
        this.rotationInterval = 5000;
        this.stockCodes = ['000001', '600000', '000858'];
        this.lastUpdateTime = null;

        this.init();
    }

    init() {
        this.loadSettings();
        this.bindEvents();
        this.loadInitialData();
    }

    // 绑定事件
    bindEvents() {
        // 最小化按钮 - 隐藏窗口到托盘
        document.getElementById('minimize-btn').addEventListener('click', () => {
            this.hideToTray();
        });

        // 关闭按钮 - 隐藏窗口
        document.getElementById('close-btn').addEventListener('click', () => {
            this.hideWindow();
        });

        // 刷新按钮
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.refreshStockData();
        });

        // 设置面板按钮
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.toggleSettings();
        });

        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('cancel-settings').click = () => {
            this.toggleSettings();
        };

        // 监听主进程消息
        this.setupIpcListeners();
    }

    // 设置IPC监听器
    setupIpcListeners() {
        // 监听股票数据更新
        window.electronAPI.on('stock-data-updated', (data) => {
            this.updateStockData(data);
        });

        // 监听打开设置面板
        window.electronAPI.on('open-settings', () => {
            this.toggleSettings();
        });
    }

    // 加载初始数据
    async loadInitialData() {
        try {
            const data = await window.electronAPI.invoke('get-stock-data');
            if (data && data.length > 0) {
                this.updateStockData(data);
            }

            const settings = await window.electronAPI.invoke('get-settings');
            if (settings) {
                this.refreshInterval = settings.refreshInterval;
                this.rotationInterval = settings.rotationInterval || 5000;
                this.stockCodes = settings.stockCodes;
                this.updateLastUpdateTime();
            }
        } catch (error) {
            console.error('加载初始数据失败:', error);
        }
    }

    // 隐藏到托盘
    hideToTray() {
        this.showTrayNotification('应用已最小化到系统托盘，点击托盘图标可重新显示');
        // 主进程会处理窗口隐藏
    }

    // 隐藏窗口
    hideWindow() {
        // 通知主进程隐藏主窗口并显示悬浮窗
        window.electronAPI.invoke('hide-main-window');
    }

    // 显示托盘通知
    showTrayNotification(message) {
        const notification = document.getElementById('tray-notification');
        const text = document.getElementById('notification-text');

        text.textContent = message;
        notification.classList.remove('hidden');

        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    }

    // 切换设置面板
    toggleSettings() {
        const settingsPanel = document.getElementById('settings-panel');

        if (settingsPanel.classList.contains('hidden')) {
            // 填充当前设置
            document.getElementById('refresh-interval').value = this.refreshInterval / 1000;
            document.getElementById('rotation-interval').value = this.rotationInterval / 1000;

            // 更新股票代码列表显示
            this.updateStockCodesList();

            settingsPanel.classList.remove('hidden');
        } else {
            settingsPanel.classList.add('hidden');
        }
    }

    // 更新股票代码列表显示
    updateStockCodesList() {
        const stockCodesList = document.getElementById('stock-codes-list');

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
        const stockName = this.getStockName(code);
        return `
            <div class="stock-code-item" data-code="${code}">
                <div class="stock-code-info">
                    <span class="stock-code-text">${code}</span>
                    <span class="stock-code-name">${stockName}</span>
                </div>
                <div class="stock-code-actions">
                    <button class="edit-stock-btn" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-stock-btn" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // 获取股票名称
    getStockName(code) {
        const stock = this.stockData.get(code);
        return stock ? stock.name : '未知股票';
    }

    // 绑定股票代码事件
    bindStockCodeEvents() {
        // 添加股票按钮
        const addBtn = document.getElementById('add-stock-btn');
        const newStockInput = document.getElementById('new-stock-code');

        if (addBtn && newStockInput) {
            addBtn.addEventListener('click', () => this.addStockCode());
            newStockInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addStockCode();
                }
            });
        }

        // 编辑和删除按钮
        document.querySelectorAll('.edit-stock-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.closest('.stock-code-item');
                this.editStockCode(item);
            });
        });

        document.querySelectorAll('.delete-stock-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.target.closest('.stock-code-item');
                this.deleteStockCode(item);
            });
        });
    }

    // 添加股票代码
    addStockCode() {
        const input = document.getElementById('new-stock-code');
        const code = input.value.trim().toUpperCase();

        if (!code) {
            this.showNotification('请输入股票代码', 'error');
            return;
        }

        if (!this.isValidStockCode(code)) {
            this.showNotification('股票代码格式不正确', 'error');
            return;
        }

        if (this.stockCodes.includes(code)) {
            this.showNotification('股票代码已存在', 'error');
            return;
        }

        this.stockCodes.push(code);
        this.updateStockCodesList();
        input.value = '';

        this.showNotification(`已添加股票代码: ${code}`, 'success');
    }

    // 编辑股票代码
    editStockCode(item) {
        const code = item.dataset.code;
        const codeText = item.querySelector('.stock-code-text');
        const codeName = item.querySelector('.stock-code-name');
        const actions = item.querySelector('.stock-code-actions');

        // 创建编辑输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.value = code;
        input.maxLength = 6;
        input.className = 'edit-input';

        // 替换显示内容
        codeText.style.display = 'none';
        codeName.style.display = 'none';
        codeText.parentNode.insertBefore(input, codeText);
        input.focus();
        input.select();

        // 更新按钮
        actions.innerHTML = `
            <button class="save-edit-btn" title="保存">
                <i class="fas fa-check"></i>
            </button>
            <button class="cancel-edit-btn" title="取消">
                <i class="fas fa-times"></i>
            </button>
        `;

        // 添加编辑状态
        item.classList.add('editing');

        // 绑定保存和取消事件
        const saveBtn = actions.querySelector('.save-edit-btn');
        const cancelBtn = actions.querySelector('.cancel-edit-btn');

        saveBtn.addEventListener('click', () => this.saveStockCodeEdit(item, input));
        cancelBtn.addEventListener('click', () => this.cancelStockCodeEdit(item, codeText, codeName, actions, code));

        // 回车保存，ESC取消
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.saveStockCodeEdit(item, input);
            } else if (e.key === 'Escape') {
                this.cancelStockCodeEdit(item, codeText, codeName, actions, code);
            }
        });
    }

    // 保存股票代码编辑
    saveStockCodeEdit(item, input) {
        const newCode = input.value.trim().toUpperCase();
        const oldCode = item.dataset.code;

        if (!newCode) {
            this.showNotification('股票代码不能为空', 'error');
            return;
        }

        if (!this.isValidStockCode(newCode)) {
            this.showNotification('股票代码格式不正确', 'error');
            return;
        }

        if (newCode !== oldCode && this.stockCodes.includes(newCode)) {
            this.showNotification('股票代码已存在', 'error');
            return;
        }

        // 更新代码
        const index = this.stockCodes.indexOf(oldCode);
        if (index !== -1) {
            this.stockCodes[index] = newCode;
            item.dataset.code = newCode;
        }

        this.updateStockCodesList();
        this.showNotification(`股票代码已更新: ${oldCode} → ${newCode}`, 'success');
    }

    // 取消股票代码编辑
    cancelStockCodeEdit(item, codeText, codeName, actions, originalCode) {
        // 恢复原始显示
        const input = item.querySelector('.edit-input');
        if (input) {
            input.remove();
        }

        codeText.style.display = '';
        codeName.style.display = '';

        // 恢复原始按钮
        actions.innerHTML = `
            <button class="edit-stock-btn" title="编辑">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-stock-btn" title="删除">
                <i class="fas fa-trash"></i>
            </button>
        `;

        // 移除编辑状态
        item.classList.remove('editing');

        // 重新绑定事件
        this.bindStockCodeEvents();
    }

    // 删除股票代码
    deleteStockCode(item) {
        const code = item.dataset.code;

        if (confirm(`确定要删除股票代码 ${code} 吗？`)) {
            const index = this.stockCodes.indexOf(code);
            if (index !== -1) {
                this.stockCodes.splice(index, 1);
                this.updateStockCodesList();
                this.showNotification(`已删除股票代码: ${code}`, 'success');
            }
        }
    }

    // 验证股票代码格式
    isValidStockCode(code) {
        // 支持格式: 000001(深市), 600000(沪市), 300001(创业板), 688001(科创板)
        const pattern = /^(0|3|6)\d{5}$/;
        return pattern.test(code);
    }

    // 保存设置
    async saveSettings() {
        const interval = parseInt(document.getElementById('refresh-interval').value) * 1000;
        const rotationInterval = parseInt(document.getElementById('rotation-interval').value) * 1000;

        if (interval < 5000 || interval > 300000) {
            this.showNotification('数据刷新间隔必须在5-300秒之间', 'error');
            return;
        }

        if (rotationInterval < 2000 || rotationInterval > 60000) {
            this.showNotification('轮播间隔必须在2-60秒之间', 'error');
            return;
        }

        if (this.stockCodes.length === 0) {
            this.showNotification('请至少添加一个股票代码', 'error');
            return;
        }

        try {
            const result = await window.electronAPI.invoke('update-settings', {
                refreshInterval: interval,
                rotationInterval: rotationInterval,
                stockCodes: this.stockCodes
            });

            if (result.success) {
                this.refreshInterval = interval;
                this.rotationInterval = rotationInterval;
                this.toggleSettings();
                this.showNotification('设置已保存，股票数据将自动更新', 'success');
            }
        } catch (error) {
            console.error('保存设置失败:', error);
            this.showNotification('保存设置失败', 'error');
        }
    }

    // 刷新股票数据
    async refreshStockData() {
        const refreshBtn = document.getElementById('refresh-btn');
        refreshBtn.classList.add('loading');

        try {
            await window.electronAPI.invoke('fetch-stock-data');
            this.showNotification('数据已更新', 'success');
        } catch (error) {
            console.error('刷新数据失败:', error);
            this.showNotification('刷新数据失败', 'error');
        } finally {
            refreshBtn.classList.remove('loading');
        }
    }

    // 更新股票数据
    updateStockData(data) {
        this.stockData.clear();
        data.forEach(stock => {
            this.stockData.set(stock.code, stock);
        });

        this.updateStockList();
        this.updateLastUpdateTime();
    }

    // 更新股票列表
    updateStockList() {
        const stockList = document.getElementById('stock-list');

        if (this.stockData.size === 0) {
            stockList.innerHTML = '<div class="no-data">暂无股票数据</div>';
            return;
        }

        stockList.innerHTML = '';
        this.stockData.forEach(stock => {
            const stockItem = this.createStockItem(stock);
            stockList.appendChild(stockItem);
        });
    }

    // 创建股票项
    createStockItem(stock) {
        const item = document.createElement('div');
        item.className = 'stock-item';

        const changeClass = parseFloat(stock.change) > 0 ? 'positive' :
            parseFloat(stock.change) < 0 ? 'negative' : 'neutral';

        const changeIcon = parseFloat(stock.change) > 0 ? '↗' :
            parseFloat(stock.change) < 0 ? '↘' : '→';

        item.innerHTML = `
            <div class="stock-info">
                <div class="stock-code">${stock.code}</div>
                <div class="stock-name">${stock.name}</div>
            </div>
            <div class="stock-price">
                <div class="current-price">¥${stock.currentPrice}</div>
                <div class="price-change ${changeClass}">
                    <span>${changeIcon}</span>
                    <span>${stock.change} (${stock.changePercent}%)</span>
                </div>
            </div>
        `;

        return item;
    }

    // 更新最后更新时间
    updateLastUpdateTime() {
        this.lastUpdateTime = new Date();
        const lastUpdateEl = document.getElementById('last-update');
        const nextUpdateEl = document.getElementById('next-update');

        lastUpdateEl.textContent = `最后更新: ${this.lastUpdateTime.toLocaleTimeString()}`;

        const nextUpdate = new Date(this.lastUpdateTime.getTime() + this.refreshInterval);
        nextUpdateEl.textContent = `下次更新: ${nextUpdate.toLocaleTimeString()}`;
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // 添加样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '6px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            fontSize: '14px'
        });

        // 根据类型设置背景色
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // 加载设置
    loadSettings() {
        // 设置通过IPC从主进程获取
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new StockWidgetRenderer();
});

// 添加通知样式
const style = document.createElement('style');
style.textContent = `
    .notification {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .loading-placeholder {
        text-align: center;
        padding: 40px 20px;
        color: #666;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
    }
    
    .loading-placeholder i {
        font-size: 24px;
        color: #667eea;
    }
    
    .no-data {
        text-align: center;
        padding: 40px 20px;
        color: #666;
    }
    
    .tray-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    }
    
    .tray-notification:not(.hidden) {
        transform: translateX(0);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .notification-content i {
        color: #3b82f6;
    }
    
    .setting-help {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        color: #666;
        font-style: italic;
    }
`;
document.head.appendChild(style);
