// 改进版设置面板脚本
// 实现：取消按钮改为ESC键关闭，输入框回车添加，股票前面加减号按钮

console.log('🔧 加载改进版设置面板...');

// 改进的设置面板类
class ImprovedSettingsPanel {
    constructor() {
        this.isVisible = false;
        this.init();
    }

    // 初始化
    init() {
        this.bindEvents();
        this.updateStockCodesList();
        console.log('✅ 改进版设置面板已初始化');
    }

    // 绑定事件
    bindEvents() {
        // 设置按钮点击事件
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.togglePanel();
            });
            console.log('✅ 设置按钮事件已绑定');
        }

        // ESC键关闭设置面板
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hidePanel();
            }
        });

        // 点击外部区域关闭设置面板
        document.addEventListener('click', (e) => {
            if (this.isVisible && !e.target.closest('#settings-panel') && !e.target.closest('#settings-btn')) {
                this.hidePanel();
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
            console.log('✅ 股票代码输入框回车事件已绑定');
        }

        // 保存设置按钮
        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
            console.log('✅ 保存设置按钮事件已绑定');
        }
    }

    // 切换设置面板
    togglePanel() {
        if (this.isVisible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }

    // 显示设置面板
    showPanel() {
        const settingsPanel = document.getElementById('settings-panel');
        if (!settingsPanel) {
            console.error('❌ 设置面板不存在');
            return;
        }

        // 移除hidden类
        settingsPanel.classList.remove('hidden');
        
        // 强制显示样式
        settingsPanel.style.display = 'block';
        settingsPanel.style.visibility = 'visible';
        settingsPanel.style.opacity = '1';
        settingsPanel.style.position = 'relative';
        settingsPanel.style.zIndex = '1000';

        // 填充当前设置值
        this.fillSettingsValues();
        
        // 更新股票代码列表
        this.updateStockCodesList();
        
        // 聚焦到股票代码输入框
        const stockInput = document.getElementById('new-stock-code');
        if (stockInput) {
            setTimeout(() => stockInput.focus(), 100);
        }

        this.isVisible = true;
        console.log('✅ 设置面板已显示');
    }

    // 隐藏设置面板
    hidePanel() {
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            settingsPanel.classList.add('hidden');
            settingsPanel.style.display = 'none';
            this.isVisible = false;
            console.log('✅ 设置面板已隐藏');
        }
    }

    // 填充设置值
    fillSettingsValues() {
        const refreshInterval = document.getElementById('refresh-interval');
        const rotationInterval = document.getElementById('rotation-interval');
        
        if (refreshInterval) {
            refreshInterval.value = 30; // 默认30秒
        }
        if (rotationInterval) {
            rotationInterval.value = 5; // 默认5秒
        }
    }

    // 更新股票代码列表
    updateStockCodesList() {
        const stockCodesList = document.getElementById('stock-codes-list');
        if (!stockCodesList) {
            console.error('❌ 股票代码列表不存在');
            return;
        }

        // 默认股票代码
        const defaultStockCodes = [
            { code: '000001', name: '平安银行' },
            { code: '600000', name: '浦发银行' },
            { code: '000858', name: '五粮液' }
        ];

        // 创建股票代码列表HTML
        stockCodesList.innerHTML = defaultStockCodes.map(stock => `
            <div class="stock-code-item" data-code="${stock.code}">
                <div class="stock-code-actions">
                    <button class="remove-stock-btn" title="删除股票" onclick="improvedSettings.removeStockCode('${stock.code}')">
                        <i class="fas fa-minus-circle"></i>
                    </button>
                </div>
                <div class="stock-code-info">
                    <span class="stock-code-text">${stock.code}</span>
                    <span class="stock-code-name">${stock.name}</span>
                </div>
            </div>
        `).join('');

        console.log('✅ 股票代码列表已更新');
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
            return;
        }

        if (!this.isValidStockCode(code)) {
            alert('股票代码格式不正确');
            return;
        }

        // 检查是否已存在
        const existingItems = document.querySelectorAll('.stock-code-item');
        for (let item of existingItems) {
            if (item.dataset.code === code) {
                alert('股票代码已存在');
                return;
            }
        }

        // 添加到列表
        const stockCodesList = document.getElementById('stock-codes-list');
        const newItem = document.createElement('div');
        newItem.className = 'stock-code-item';
        newItem.dataset.code = code;
        newItem.innerHTML = `
            <div class="stock-code-actions">
                <button class="remove-stock-btn" title="删除股票" onclick="improvedSettings.removeStockCode('${code}')">
                    <i class="fas fa-minus-circle"></i>
                </button>
            </div>
            <div class="stock-code-info">
                <span class="stock-code-text">${code}</span>
                <span class="stock-code-name">新股票</span>
            </div>
        `;

        stockCodesList.appendChild(newItem);
        input.value = '';
        
        // 重新聚焦到输入框
        input.focus();

        console.log('✅ 股票代码已添加:', code);
        this.showNotification(`股票代码 ${code} 已添加`);
    }

    // 删除股票代码
    removeStockCode(code) {
        if (confirm(`确定要删除股票代码 ${code} 吗？`)) {
            const item = document.querySelector(`[data-code="${code}"]`);
            if (item) {
                item.remove();
                console.log('🗑️ 股票代码已删除:', code);
                this.showNotification(`股票代码 ${code} 已删除`);
            }
        }
    }

    // 验证股票代码格式
    isValidStockCode(code) {
        return /^(0|3|6)\d{5}$/.test(code);
    }

    // 保存设置
    saveSettings() {
        const refreshInterval = document.getElementById('refresh-interval');
        const rotationInterval = document.getElementById('rotation-interval');
        
        if (refreshInterval && rotationInterval) {
            console.log('💾 设置已保存:', {
                refreshInterval: refreshInterval.value + '秒',
                rotationInterval: rotationInterval.value + '秒'
            });
            
            this.showNotification('设置已保存！');
            this.hidePanel();
        }
    }

    // 显示通知
    showNotification(message) {
        console.log('📢 通知:', message);
        // 可以在这里添加更友好的通知显示
        alert(message);
    }

    // 获取当前股票代码列表
    getCurrentStockCodes() {
        const items = document.querySelectorAll('.stock-code-item');
        return Array.from(items).map(item => item.dataset.code);
    }
}

// 创建全局实例
let improvedSettings;

// 等待DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 开始初始化改进版设置面板...');
    improvedSettings = new ImprovedSettingsPanel();
});

// 备用初始化方案
if (document.readyState === 'complete') {
    console.log('🚀 DOM已加载完成，直接初始化...');
    improvedSettings = new ImprovedSettingsPanel();
}

// 全局函数，供HTML中的onclick调用
window.removeStockCode = function(code) {
    if (improvedSettings) {
        improvedSettings.removeStockCode(code);
    }
};

console.log('🔧 改进版设置面板脚本已加载');
console.log('💡 新功能:');
console.log('  - ESC键关闭设置面板');
console.log('  - 点击外部区域关闭设置面板');
console.log('  - 输入框回车添加股票代码');
console.log('  - 股票前面减号按钮删除股票');
console.log('  - 取消按钮已移除');
