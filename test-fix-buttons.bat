@echo off
echo 测试按钮修复...
echo.

echo 修复内容:
echo 1. 设置按钮功能修复
echo 2. 关闭按钮功能修复
echo 3. 添加缺失的IPC处理程序
echo 4. 更新preload.js通道列表
echo.

echo 测试步骤:
echo 1. 运行应用: npm start
echo 2. 测试设置按钮: 点击右上角设置按钮(⚙️)
echo 3. 测试关闭按钮: 点击右上角关闭按钮(×)
echo 4. 验证设置面板是否正常打开/关闭
echo 5. 验证关闭按钮是否隐藏主窗口并显示悬浮窗
echo.

echo 预期结果:
echo ✓ 设置按钮点击后显示设置面板
echo ✓ 设置面板中包含股票代码管理功能
echo ✓ 关闭按钮点击后隐藏主窗口
echo ✓ 隐藏主窗口后显示悬浮窗
echo.

echo 如果仍有问题，请检查:
echo - 控制台是否有错误信息
echo - 网络连接是否正常
echo - 是否有其他应用占用端口
echo.

pause
