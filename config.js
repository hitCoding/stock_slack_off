// 股票行情小工具配置文件
module.exports = {
    // 股票轮播显示间隔（毫秒）
    stockRotationInterval: 5000, // 5秒

    // 股票数据刷新间隔（毫秒）
    stockDataRefreshInterval: 30000, // 30秒

    // 默认股票代码
    defaultStockCodes: ['000001', '600000', '000858'],

    // 显示模式: 'tray' (系统托盘) 或 'taskbar' (任务栏按钮)
    displayMode: 'tray',

    // 是否在任务栏显示股票信息
    showInTaskbar: true,

    // 是否启用股票轮播
    enableStockRotation: true,

    // 任务栏显示格式
    taskbarDisplayFormat: {
        showEmoji: true,        // 显示表情符号
        showChangeSymbol: true, // 显示涨跌符号
        showPercentage: true,   // 显示涨跌幅
        maxTooltipLength: 100,  // 最大提示长度
        showInTitle: true,      // 在任务栏标题显示
        showInTooltip: true     // 在悬停提示显示
    },

    // 任务栏按钮设置
    taskbarButton: {
        showIcon: true,         // 显示图标
        showTitle: true,        // 显示标题
        showTooltip: true,      // 显示提示
        clickToShow: true,      // 点击显示窗口
        rightClickMenu: true    // 右键菜单
    }
}; 
