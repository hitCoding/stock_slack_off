// 股票小工具主类
class StockWidget {
    constructor() {
        this.stockData = new Map();
        this.refreshInterval = 30000; // 默认30秒刷新
        this.stockCodes = ['000001', '600000', '000858']; // 默认股票代码
        this.isMinimized = false;
        this.isSettingsOpen = false;
        this.refreshTimer = null;
        this.lastUpdateTime = null;

        this.init();
    }

    init() {
        this.loadSettings();
        this.bindEvents();
        this.startAutoRefresh();
        this.fetchStockData();
    }

    // 绑定事件
    bindEvents() {
        // 最小化按钮
        document.getElementById('minimize-btn').addEventListener('click', () => {
            this.toggleMinimize();
        });

        // 关闭按钮
        document.getElementById('close-btn').addEventListener('click', () => {
            this.close();
        });

        // 设置按钮
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.toggleSettings();
        });

        // 最小化的小工具点击
        document.getElementById('minimized-widget').addEventListener('click', () => {
            this.toggleMinimize();
        });

        // 刷新按钮
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.fetchStockData();
        });

        // 设置面板按钮
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('cancel-settings').addEventListener('click', () => {
            this.toggleSettings();
        });

        // 拖拽功能
        this.enableDragging();
    }

    // 启用拖拽
    enableDragging() {
        const widget = document.getElementById('stock-widget');
        const header = document.querySelector('.widget-header');
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.widget-controls')) return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            const rect = widget.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);

            e.preventDefault();
        });

        const onMouseMove = (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            const newLeft = startLeft + deltaX;
            const newTop = startTop + deltaY;

            // 限制在窗口范围内
            const maxLeft = window.innerWidth - widget.offsetWidth;
            const maxTop = window.innerHeight - widget.offsetHeight;

            widget.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
            widget.style.top = Math.max(0, Math.min(newTop, maxTop)) + 'px';
            widget.style.right = 'auto';
            widget.style.bottom = 'auto';
        };

        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }

    // 切换最小化状态
    toggleMinimize() {
        const widget = document.getElementById('stock-widget');
        const minimizedWidget = document.getElementById('minimized-widget');

        if (this.isMinimized) {
            widget.classList.remove('hidden');
            minimizedWidget.classList.add('hidden');
            this.isMinimized = false;
        } else {
            widget.classList.add('hidden');
            minimizedWidget.classList.remove('hidden');
            this.isMinimized = true;
        }
    }

    // 关闭小工具
    close() {
        this.stopAutoRefresh();
        document.getElementById('stock-widget').style.display = 'none';
        document.getElementById('minimized-widget').style.display = 'none';
        document.getElementById('settings-btn').style.display = 'none';
    }

    // 切换设置面板
    toggleSettings() {
        const settingsPanel = document.getElementById('settings-panel');

        if (this.isSettingsOpen) {
            settingsPanel.classList.add('hidden');
            this.isSettingsOpen = false;
        } else {
            // 填充当前设置
            document.getElementById('refresh-interval').value = this.refreshInterval / 1000;
            document.getElementById('stock-codes').value = this.stockCodes.join(',');

            settingsPanel.classList.remove('hidden');
            this.isSettingsOpen = true;
        }
    }

    // 保存设置
    saveSettings() {
        const interval = parseInt(document.getElementById('refresh-interval').value) * 1000;
        const codes = document.getElementById('stock-codes').value
            .split(',')
            .map(code => code.trim())
            .filter(code => code.length > 0);

        if (interval < 5000 || interval > 300000) {
            alert('刷新间隔必须在5-300秒之间');
            return;
        }

        if (codes.length === 0) {
            alert('请输入至少一个股票代码');
            return;
        }

        this.refreshInterval = interval;
        this.stockCodes = codes;

        this.saveSettingsToStorage();
        this.toggleSettings();
        this.restartAutoRefresh();
        this.fetchStockData();

        // 显示成功消息
        this.showNotification('设置已保存', 'success');
    }

    // 保存设置到本地存储
    saveSettingsToStorage() {
        const settings = {
            refreshInterval: this.refreshInterval,
            stockCodes: this.stockCodes
        };
        localStorage.setItem('stockWidgetSettings', JSON.stringify(settings));
    }

    // 从本地存储加载设置
    loadSettings() {
        const saved = localStorage.getItem('stockWidgetSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.refreshInterval = settings.refreshInterval || 30000;
                this.stockCodes = settings.stockCodes || ['000001', '600000', '000858'];
            } catch (e) {
                console.error('加载设置失败:', e);
            }
        }
    }

    // 开始自动刷新
    startAutoRefresh() {
        this.refreshTimer = setInterval(() => {
            this.fetchStockData();
        }, this.refreshInterval);
    }

    // 停止自动刷新
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    // 重启自动刷新
    restartAutoRefresh() {
        this.stopAutoRefresh();
        this.startAutoRefresh();
    }

    // 获取股票数据
    async fetchStockData() {
        const refreshBtn = document.getElementById('refresh-btn');
        refreshBtn.classList.add('loading');

        try {
            // 模拟股票数据（实际项目中应该调用真实的股票API）
            const mockData = this.generateMockStockData();

            // 更新股票数据
            this.stockData.clear();
            mockData.forEach(stock => {
                this.stockData.set(stock.code, stock);
            });

            // 更新UI
            this.updateStockList();
            this.updateLastUpdateTime();

            // 显示成功消息
            this.showNotification('数据已更新', 'success');

        } catch (error) {
            console.error('获取股票数据失败:', error);
            this.showNotification('获取数据失败', 'error');
        } finally {
            refreshBtn.classList.remove('loading');
        }
    }

    // 生成模拟股票数据
    generateMockStockData() {
        const stockNames = {
            '000001': '平安银行',
            '600000': '浦发银行',
            '000858': '五粮液',
            '000002': '万科A',
            '600036': '招商银行',
            '000001': '平安银行',
            '600519': '贵州茅台',
            '000858': '五粮液'
        };

        return this.stockCodes.map(code => {
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
    }

    // 更新股票列表
    updateStockList() {
        const stockList = document.getElementById('stock-list');
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
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new StockWidget();
});

// 添加通知样式
const style = document.createElement('style');
style.textContent = `
    .notification {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
`;
document.head.appendChild(style);
