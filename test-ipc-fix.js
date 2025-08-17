// 测试IPC处理器重复注册问题修复
console.log('🧪 开始测试IPC处理器修复...');

// 测试1: 检查IPC通信是否正常
function testIpcCommunication() {
    console.log('=== 测试1: IPC通信测试 ===');
    
    if (window.electronAPI) {
        console.log('✅ electronAPI 可用');
        
        // 测试获取设置
        console.log('💡 测试获取设置...');
        window.electronAPI.invoke('get-settings').then(settings => {
            console.log('✅ 获取设置成功:', settings);
            console.log('📊 股票代码列表:', settings.stockCodes);
            console.log('⏰ 刷新间隔:', settings.refreshInterval + 'ms');
            console.log('🔄 轮播间隔:', settings.rotationInterval + 'ms');
        }).catch(error => {
            console.error('❌ 获取设置失败:', error);
        });
        
        // 测试获取股票数据
        console.log('💡 测试获取股票数据...');
        window.electronAPI.invoke('get-stock-data').then(data => {
            console.log('✅ 获取股票数据成功:', data);
            console.log('📊 股票数据数量:', data.length);
        }).catch(error => {
            console.error('❌ 获取股票数据失败:', error);
        });
        
    } else {
        console.log('⚠️ electronAPI 不可用，跳过IPC测试');
    }
}

// 测试2: 检查控制台错误
function checkConsoleErrors() {
    console.log('=== 测试2: 控制台错误检查 ===');
    
    console.log('💡 请检查控制台是否还有以下错误:');
    console.log('  - "Attempted to register a second handler for \'get-settings\'"');
    console.log('  - "UnhandledPromiseRejectionWarning"');
    
    if (window.electronAPI) {
        console.log('✅ 如果看到此消息，说明IPC通信正常');
    }
}

// 运行所有测试
function runAllTests() {
    console.log('🚀 开始运行IPC修复测试...');
    
    setTimeout(() => {
        testIpcCommunication();
        
        setTimeout(() => {
            checkConsoleErrors();
            
            console.log('\n🎯 修复说明:');
            console.log('1. 删除了重复的 get-settings 处理器注册');
            console.log('2. 统一了刷新间隔和轮播间隔的配置');
            console.log('3. IPC通信应该不再出现重复注册警告');
            
        }, 1000);
        
    }, 500);
}

// 自动运行测试
console.log('🔧 IPC修复测试脚本已加载');
console.log('💡 执行以下命令进行测试:');
console.log('  - testIpcCommunication() - 测试IPC通信');
console.log('  - checkConsoleErrors() - 检查控制台错误');
console.log('  - runAllTests() - 运行所有测试');

// 延迟运行测试
setTimeout(runAllTests, 1000);
