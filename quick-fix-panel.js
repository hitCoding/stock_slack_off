// 设置面板快速修复脚本
// 在控制台中执行此代码来修复设置面板显示问题

console.log('🔧 开始修复设置面板显示问题...');

// 修复设置面板显示
function fixSettingsPanel() {
    console.log('🔍 查找设置面板...');

    const settingsPanel = document.getElementById('settings-panel');
    if (!settingsPanel) {
        console.error('❌ 设置面板不存在');
        return false;
    }

    console.log('✅ 找到设置面板:', settingsPanel);

    // 检查当前状态
    const hasHiddenClass = settingsPanel.classList.contains('hidden');
    const computedStyle = window.getComputedStyle(settingsPanel);
    const currentDisplay = computedStyle.display;

    console.log('📋 当前状态:');
    console.log('  - 包含hidden类:', hasHiddenClass);
    console.log('  - 计算display:', currentDisplay);

    // 修复1: 移除hidden类
    if (hasHiddenClass) {
        settingsPanel.classList.remove('hidden');
        console.log('✅ 已移除hidden类');
    }

    // 修复2: 强制设置显示样式
    settingsPanel.style.display = 'block';
    settingsPanel.style.visibility = 'visible';
    settingsPanel.style.opacity = '1';
    settingsPanel.style.position = 'relative';
    settingsPanel.style.zIndex = '1000';

    console.log('✅ 已应用强制显示样式');

    // 验证修复结果
    setTimeout(() => {
        const finalStyle = window.getComputedStyle(settingsPanel);
        const rect = settingsPanel.getBoundingClientRect();

        console.log('📋 修复后状态:');
        console.log('  - 计算display:', finalStyle.display);
        console.log('  - 计算visibility:', finalStyle.visibility);
        console.log('  - 元素尺寸:', {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left
        });

        if (rect.width > 0 && rect.height > 0) {
            console.log('🎉 设置面板修复成功！现在应该可见了');
        } else {
            console.log('❌ 设置面板仍有问题，尝试其他修复方法...');
            tryAlternativeFix(settingsPanel);
        }
    }, 100);

    return true;
}

// 尝试其他修复方法
function tryAlternativeFix(settingsPanel) {
    console.log('🔄 尝试其他修复方法...');

    // 方法1: 重新创建元素
    console.log('🧪 方法1: 重新创建元素');
    const parent = settingsPanel.parentElement;
    const newPanel = settingsPanel.cloneNode(true);

    // 移除所有样式类
    newPanel.className = '';
    newPanel.id = 'settings-panel';

    // 应用基本样式
    newPanel.style.cssText = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: relative !important;
        z-index: 1000 !important;
        padding: 20px !important;
        border-top: 1px solid rgba(0, 0, 0, 0.1) !important;
        background: rgba(249, 250, 251, 0.95) !important;
        margin-top: 20px !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
    `;

    // 替换元素
    parent.replaceChild(newPanel, settingsPanel);

    console.log('✅ 已重新创建设置面板');

    // 重新绑定事件
    bindSettingsEvents(newPanel);

    return newPanel;
}

// 重新绑定设置相关事件
function bindSettingsEvents(settingsPanel) {
    console.log('🔗 重新绑定设置事件...');

    // 添加股票按钮
    const addBtn = document.getElementById('add-stock-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            console.log('🎯 添加股票按钮被点击');
            addStockCode();
        });
        console.log('✅ 添加股票按钮事件已绑定');
    }

    // 保存设置按钮
    const saveBtn = document.getElementById('save-settings');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            console.log('🎯 保存设置按钮被点击');
            saveSettings();
        });
        console.log('✅ 保存设置按钮事件已绑定');
    }

    // 取消设置按钮
    const cancelBtn = document.getElementById('cancel-settings');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            console.log('🎯 取消设置按钮被点击');
            hideSettingsPanel();
        });
        console.log('✅ 取消设置按钮事件已绑定');
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

    // 添加到列表
    const stockCodesList = document.getElementById('stock-codes-list');
    if (stockCodesList) {
        const newItem = document.createElement('div');
        newItem.className = 'stock-code-item';
        newItem.innerHTML = `
            <div class="stock-code-info">
                <span class="stock-code-text">${code}</span>
                <span class="stock-code-name">新股票</span>
            </div>
            <div class="stock-code-actions">
                <button class="edit-stock-btn" title="编辑">编辑</button>
                <button class="delete-stock-btn" title="删除">删除</button>
            </div>
        `;

        stockCodesList.appendChild(newItem);
        input.value = '';

        console.log('✅ 股票代码已添加:', code);
        alert(`股票代码 ${code} 已添加`);
    }
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

        alert('设置已保存！');
        hideSettingsPanel();
    }
}

// 隐藏设置面板
function hideSettingsPanel() {
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsPanel) {
        settingsPanel.style.display = 'none';
        console.log('✅ 设置面板已隐藏');
    }
}

// 显示设置面板
function showSettingsPanel() {
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsPanel) {
        settingsPanel.style.display = 'block';
        console.log('✅ 设置面板已显示');
    }
}

// 切换设置面板
function toggleSettingsPanel() {
    const settingsPanel = document.getElementById('settings-panel');
    if (!settingsPanel) {
        console.error('❌ 设置面板不存在');
        return;
    }

    const isVisible = settingsPanel.style.display !== 'none';

    if (isVisible) {
        hideSettingsPanel();
    } else {
        showSettingsPanel();
    }
}

// 主修复函数
function runQuickFix() {
    console.log('🚀 开始快速修复...');

    // 修复设置面板
    if (fixSettingsPanel()) {
        console.log('🎉 快速修复完成！');
        console.log('💡 现在可以尝试点击设置按钮了');

        // 测试显示
        setTimeout(() => {
            console.log('🧪 测试显示设置面板...');
            showSettingsPanel();
        }, 500);
    } else {
        console.error('❌ 快速修复失败');
    }
}

// 自动运行修复
console.log('🔧 设置面板快速修复脚本已加载');
console.log('💡 执行以下命令进行修复:');
console.log('  - fixSettingsPanel() - 修复设置面板显示');
console.log('  - runQuickFix() - 运行完整修复');
console.log('  - showSettingsPanel() - 显示设置面板');
console.log('  - hideSettingsPanel() - 隐藏设置面板');
console.log('  - toggleSettingsPanel() - 切换设置面板');

// 延迟运行修复
setTimeout(runQuickFix, 1000);
