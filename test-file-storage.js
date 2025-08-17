// 测试股票代码文件存储功能
console.log('🧪 开始测试股票代码文件存储功能...');

// 测试1: 检查配置文件是否存在
function testConfigFile() {
    console.log('=== 测试1: 配置文件检查 ===');

    // 检查配置文件是否存在
    const fs = require('fs');
    const path = require('path');
    const configFile = path.join(__dirname, 'stock-codes.json');

    if (fs.existsSync(configFile)) {
        console.log('✅ 配置文件存在:', configFile);

        try {
            const data = fs.readFileSync(configFile, 'utf8');
            const config = JSON.parse(data);
            console.log('✅ 配置文件内容:', config);
            console.log('📊 当前股票代码数量:', config.stockCodes.length);
            console.log('📅 最后更新时间:', config.lastUpdated);
        } catch (error) {
            console.error('❌ 读取配置文件失败:', error);
        }
    } else {
        console.log('❌ 配置文件不存在');
    }
}

// 测试2: 测试IPC通信获取设置
function testIpcSettings() {
    console.log('=== 测试2: IPC设置获取测试 ===');

    if (window.electronAPI) {
        console.log('✅ electronAPI 可用');
        console.log('💡 尝试获取设置...');

        window.electronAPI.invoke('get-settings').then(settings => {
            console.log('✅ 获取设置成功:', settings);
            console.log('📊 股票代码列表:', settings.stockCodes);
        }).catch(error => {
            console.error('❌ 获取设置失败:', error);
        });
    } else {
        console.log('⚠️ electronAPI 不可用，跳过IPC测试');
    }
}

// 测试3: 测试添加股票后的文件更新
function testAddStockUpdate() {
    console.log('=== 测试3: 添加股票文件更新测试 ===');

    console.log('💡 请按以下步骤测试:');
    console.log('1. 在设置面板中添加一个新股票代码（如：600519）');
    console.log('2. 按回车键添加');
    console.log('3. 观察控制台是否显示"股票代码已保存到配置文件"');
    console.log('4. 检查 stock-codes.json 文件是否更新');
    console.log('5. 重启应用，观察是否自动加载新添加的股票代码');
}

// 测试4: 测试删除股票后的文件更新
function testDeleteStockUpdate() {
    console.log('=== 测试4: 删除股票文件更新测试 ===');

    console.log('💡 请按以下步骤测试:');
    console.log('1. 在设置面板中删除一个股票代码');
    console.log('2. 点击减号按钮确认删除');
    console.log('3. 观察控制台是否显示"股票代码已保存到配置文件"');
    console.log('4. 检查 stock-codes.json 文件是否更新');
    console.log('5. 重启应用，观察是否自动加载更新后的股票代码列表');
}

// 测试5: 测试应用重启后的配置加载
function testRestartConfig() {
    console.log('=== 测试5: 应用重启配置加载测试 ===');

    console.log('💡 请按以下步骤测试:');
    console.log('1. 修改 stock-codes.json 文件，添加或删除股票代码');
    console.log('2. 保存文件');
    console.log('3. 重启应用');
    console.log('4. 观察控制台是否显示"已从配置文件加载股票代码"');
    console.log('5. 检查设置面板中的股票代码列表是否与文件一致');
}

// 运行所有测试
function runAllTests() {
    console.log('🚀 开始运行所有文件存储测试...');

    setTimeout(() => {
        testConfigFile();

        setTimeout(() => {
            testIpcSettings();

            setTimeout(() => {
                testAddStockUpdate();
                testDeleteStockUpdate();
                testRestartConfig();

                console.log('\n🎯 文件存储功能说明:');
                console.log('1. 股票代码现在会保存到 stock-codes.json 文件');
                console.log('2. 应用启动时会自动读取配置文件');
                console.log('3. 添加/删除股票后会自动保存到文件');
                console.log('4. 重启应用后股票代码列表会自动恢复');
                console.log('5. 可以手动编辑配置文件来批量修改股票代码');

            }, 1000);

        }, 1000);

    }, 500);
}

// 自动运行测试
console.log('🔧 文件存储测试脚本已加载');
console.log('💡 执行以下命令进行测试:');
console.log('  - testConfigFile() - 测试配置文件检查');
console.log('  - testIpcSettings() - 测试IPC设置获取');
console.log('  - testAddStockUpdate() - 测试添加股票文件更新');
console.log('  - testDeleteStockUpdate() - 测试删除股票文件更新');
console.log('  - testRestartConfig() - 测试重启配置加载');
console.log('  - runAllTests() - 运行所有测试');

// 延迟运行测试
setTimeout(runAllTests, 1000);
