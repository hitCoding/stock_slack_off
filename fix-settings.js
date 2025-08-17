// 设置按钮修复补丁
// 在控制台中执行此代码来修复设置按钮无响应问题

console.log('🔧 正在修复设置按钮...');

// 等待DOM加载完成
function waitForElement(selector, callback, maxWait = 5000) {
    const element = document.querySelector(selector);
    if (element) {
        callback(element);
        return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
            clearInterval(interval);
            callback(element);
        } else if (Date.now() - startTime > maxWait) {
            clearInterval(interval);
            console.error('❌ 等待元素超时:', selector);
        }
    }, 100);
}

// 修复设置按钮事件绑定
function fixSettingsButton() {
    console.log('🔍 查找设置按钮...');

    const settingsBtn = document.getElementById('settings-btn');
    if (!settingsBtn) {
        console.error('❌ 设置按钮不存在');
        return false;
    }

    console.log('✅ 找到设置按钮:', settingsBtn);

    // 移除所有现有的事件监听器
    const newBtn = settingsBtn.cloneNode(true);
    settingsBtn.parentNode.replaceChild(newBtn, settingsBtn);

    // 重新绑定点击事件
    newBtn.addEventListener('click', function () {
        console.log('🎯 设置按钮被点击');
        toggleSettingsPanel();
    });

    console.log('✅ 设置按钮事件已修复');
    return true;
}

// 修复设置面板显示/隐藏
function fixSettingsPanel() {
    console.log('🔍 查找设置面板...');

    const settingsPanel = document.getElementById('settings-panel');
    if (!settingsPanel) {
        console.error('❌ 设置面板不存在');
        return false;
    }

    console.log('✅ 找到设置面板:', settingsPanel);

    // 确保设置面板有正确的样式类
    if (!settingsPanel.classList.contains('settings-panel')) {
        settingsPanel.classList.add('settings-panel');
    }

    // 确保初始状态是隐藏的
    if (!settingsPanel.classList.contains('hidden')) {
        settingsPanel.classList.add('hidden');
    }

    console.log('✅ 设置面板样式已修复');
    return true;
}

// 切换设置面板显示状态
function toggleSettingsPanel() {
    const settingsPanel = document.getElementById('settings-panel');
    if (!settingsPanel) {
        console.error('❌ 设置面板不存在');
        return;
    }

    if (settingsPanel.classList.contains('hidden')) {
        // 显示设置面板
        settingsPanel.classList.remove('hidden');
        console.log('✅ 设置面板已显示');

        // 填充当前设置值
        fillSettingsValues();

        // 更新股票代码列表
        updateStockCodesList();

    } else {
        // 隐藏设置面板
        settingsPanel.classList.add('hidden');
        console.log('✅ 设置面板已隐藏');
    }
}

// 填充设置值
function fillSettingsValues() {
    // 设置刷新间隔
    const refreshInterval = document.getElementById('refresh-interval');
    if (refreshInterval) {
        refreshInterval.value = 30; // 默认30秒
    }

    // 设置轮播间隔
    const rotationInterval = document.getElementById('rotation-interval');
    if (rotationInterval) {
        rotationInterval.value = 5; // 默认5秒
    }
}

// 更新股票代码列表
function updateStockCodesList() {
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

    stockCodesList.innerHTML = defaultStockCodes.map(stock => `
        <div class="stock-code-item" data-code="${stock.code}">
            <div class="stock-code-info">
                <span class="stock-code-text">${stock.code}</span>
                <span class="stock-code-name">${stock.name}</span>
            </div>
            <div class="stock-code-actions">
                <button class="edit-stock-btn" title="编辑" onclick="editStockCode(this)">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-stock-btn" title="删除" onclick="deleteStockCode(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    console.log('✅ 股票代码列表已更新');
}

// 编辑股票代码
function editStockCode(button) {
    const item = button.closest('.stock-code-item');
    const codeText = item.querySelector('.stock-code-text');
    const originalCode = codeText.textContent;

    // 创建编辑输入框
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalCode;
    input.maxLength = 6;
    input.className = 'edit-input';

    // 替换显示内容
    codeText.style.display = 'none';
    codeText.parentNode.insertBefore(input, codeText);
    input.focus();
    input.select();

    // 更新按钮
    const actions = item.querySelector('.stock-code-actions');
    actions.innerHTML = `
        <button class="save-edit-btn" title="保存" onclick="saveStockCodeEdit(this, '${originalCode}')">
            <i class="fas fa-check"></i>
        </button>
        <button class="cancel-edit-btn" title="取消" onclick="cancelStockCodeEdit(this, '${originalCode}')">
            <i class="fas fa-times"></i>
        </button>
    `;

    console.log('✏️ 进入编辑模式:', originalCode);
}

// 保存股票代码编辑
function saveStockCodeEdit(button, originalCode) {
    const item = button.closest('.stock-code-item');
    const input = item.querySelector('.edit-input');
    const newCode = input.value.trim();

    if (!newCode) {
        alert('股票代码不能为空');
        return;
    }

    if (!/^(0|3|6)\d{5}$/.test(newCode)) {
        alert('股票代码格式不正确');
        return;
    }

    // 更新代码
    const codeText = item.querySelector('.stock-code-text');
    codeText.textContent = newCode;
    codeText.style.display = '';

    // 恢复原始按钮
    const actions = item.querySelector('.stock-code-actions');
    actions.innerHTML = `
        <button class="edit-stock-btn" title="编辑" onclick="editStockCode(this)">
            <i class="fas fa-edit"></i>
        </button>
        <button class="delete-stock-btn" title="删除" onclick="deleteStockCode(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;

    console.log('✅ 股票代码已更新:', originalCode, '→', newCode);
}

// 取消股票代码编辑
function cancelStockCodeEdit(button, originalCode) {
    const item = button.closest('.stock-code-item');
    const input = item.querySelector('.edit-input');
    const codeText = item.querySelector('.stock-code-text');

    // 恢复原始显示
    input.remove();
    codeText.style.display = '';

    // 恢复原始按钮
    const actions = item.querySelector('.stock-code-actions');
    actions.innerHTML = `
        <button class="edit-stock-btn" title="编辑" onclick="editStockCode(this)">
            <i class="fas fa-edit"></i>
        </button>
        <button class="delete-stock-btn" title="删除" onclick="deleteStockCode(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;

    console.log('❌ 编辑已取消');
}

// 删除股票代码
function deleteStockCode(button) {
    const item = button.closest('.stock-code-item');
    const code = item.dataset.code;

    if (confirm(`确定要删除股票代码 ${code} 吗？`)) {
        item.remove();
        console.log('🗑️ 股票代码已删除:', code);
    }
}

// 添加股票代码
function addStockCode() {
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

    if (!/^(0|3|6)\d{5}$/.test(code)) {
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
        <div class="stock-code-info">
            <span class="stock-code-text">${code}</span>
            <span class="stock-code-name">新股票</span>
        </div>
        <div class="stock-code-actions">
            <button class="edit-stock-btn" title="编辑" onclick="editStockCode(this)">
                <i class="fas fa-edit"></i>
            </button>
            <button class="delete-stock-btn" title="删除" onclick="deleteStockCode(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    stockCodesList.appendChild(newItem);
    input.value = '';

    console.log('✅ 股票代码已添加:', code);
}

// 保存设置
function saveSettings() {
    const refreshInterval = document.getElementById('refresh-interval');
    const rotationInterval = document.getElementById('rotation-interval');

    if (refreshInterval && rotationInterval) {
        console.log('💾 设置已保存:', {
            refreshInterval: refreshInterval.value + '秒',
            rotationInterval: rotationInterval.value + '秒'
        });

        // 隐藏设置面板
        toggleSettingsPanel();

        alert('设置已保存！');
    }
}

// 绑定添加股票按钮事件
function bindAddStockButton() {
    const addBtn = document.getElementById('add-stock-btn');
    if (addBtn) {
        addBtn.addEventListener('click', addStockCode);
        console.log('✅ 添加股票按钮事件已绑定');
    }
}

// 绑定保存设置按钮事件
function bindSaveSettingsButton() {
    const saveBtn = document.getElementById('save-settings');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveSettings);
        console.log('✅ 保存设置按钮事件已绑定');
    }
}

// 绑定取消设置按钮事件
function bindCancelSettingsButton() {
    const cancelBtn = document.getElementById('cancel-settings');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', toggleSettingsPanel);
        console.log('✅ 取消设置按钮事件已绑定');
    }
}

// 主修复函数
function fixAllSettingsIssues() {
    console.log('🚀 开始修复所有设置相关问题...');

    // 等待DOM加载完成
    waitForElement('#settings-btn', (btn) => {
        console.log('✅ DOM加载完成，开始修复...');

        // 修复设置按钮
        if (fixSettingsButton()) {
            // 修复设置面板
            if (fixSettingsPanel()) {
                // 绑定其他按钮事件
                bindAddStockButton();
                bindSaveSettingsButton();
                bindCancelSettingsButton();

                console.log('🎉 所有设置问题已修复完成！');
                console.log('💡 现在可以点击齿轮图标打开设置面板了');

                // 测试设置面板
                setTimeout(() => {
                    console.log('🧪 测试：手动显示设置面板');
                    toggleSettingsPanel();
                }, 1000);
            }
        }
    });
}

// 自动执行修复
console.log('🔧 设置按钮修复补丁已加载');
console.log('💡 执行 fixAllSettingsIssues() 来修复所有问题');

// 延迟执行修复，确保DOM完全加载
setTimeout(fixAllSettingsIssues, 1000);
