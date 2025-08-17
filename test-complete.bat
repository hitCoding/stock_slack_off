@echo off
echo ========================================
echo 股票行情小工具 - 完整功能测试
echo ========================================
echo.

echo 新功能列表:
echo ✓ 悬浮窗完全透明
echo ✓ 动态增减股票代码
echo ✓ 股票代码编辑功能
echo ✓ 股票代码验证
echo ✓ 设置面板优化
echo ✓ macOS图标尺寸修复
echo.

echo 测试步骤:
echo 1. 启动应用: npm start
echo 2. 测试悬浮窗透明度
echo 3. 测试股票代码管理
echo 4. 测试设置保存
echo 5. 验证数据更新
echo.

echo 详细测试项目:
echo.
echo [悬浮窗功能]
echo - 主窗口最小化时显示悬浮窗
echo - 悬浮窗完全透明，只显示文字
echo - 悬浮窗可拖拽移动
echo - 悬浮窗可调整大小
echo - 悬浮窗始终置顶
echo.

echo [股票代码管理]
echo - 点击设置按钮打开设置面板
echo - 添加新股票代码 (如: 000002, 600036)
echo - 编辑现有股票代码
echo - 删除不需要的股票代码
echo - 验证股票代码格式
echo.

echo [数据功能]
echo - 实时获取东方财富数据
echo - 自动轮播显示股票信息
echo - 定时刷新数据
echo - 托盘显示股票信息
echo.

echo [系统托盘]
echo - 右键菜单功能
echo - 点击切换窗口显示
echo - 图标尺寸正常 (Windows: 16x16, macOS: 18x18)
echo.

echo 注意事项:
echo - 确保网络连接正常以获取实时数据
echo - 股票代码格式: 6位数字，支持深市、沪市、创业板、科创板
echo - 设置更改后会自动更新股票数据
echo.

echo 按任意键开始测试...
pause >nul

echo.
echo 开始测试...
echo 请按照上述步骤逐一测试各项功能
echo 如有问题，请查看控制台输出信息
echo.
pause
