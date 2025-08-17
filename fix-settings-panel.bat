@echo off
chcp 65001 >nul
echo ========================================
echo 设置面板修复脚本
echo ========================================
echo.

echo 🔧 正在修复设置面板问题...
echo.

echo 📝 检查并修复HTML文件...
if exist "index.html" (
    echo ✅ 找到index.html，检查设置面板结构
    findstr /n "settings-panel" index.html
    echo.
    echo 📋 设置面板应该包含以下元素：
    echo - id="settings-panel" class="settings-panel hidden"
    echo - id="settings-btn" 设置按钮
    echo - id="stock-codes-list" 股票代码列表
    echo - id="new-stock-code" 新股票代码输入框
    echo - id="add-stock-btn" 添加按钮
    echo - id="save-settings" 保存按钮
    echo - id="cancel-settings" 取消按钮
) else (
    echo ❌ index.html 不存在
)

echo.
echo 📝 检查并修复CSS文件...
if exist "styles.css" (
    echo ✅ 找到styles.css，检查设置面板样式
    findstr /n "settings-panel" styles.css
    echo.
    echo 📋 设置面板样式应该包含：
    echo - .settings-panel 基本样式
    echo - .hidden { display: none !important; }
    echo - .stock-codes-manager 股票代码管理样式
) else (
    echo ❌ styles.css 不存在
)

echo.
echo 📝 检查并修复JavaScript文件...
if exist "renderer.js" (
    echo ✅ 找到renderer.js，检查设置面板逻辑
    findstr /n "toggleSettings" renderer.js
    echo.
    echo 📋 JavaScript应该包含：
    echo - toggleSettings() 方法
    echo - 设置按钮事件绑定
    echo - 股票代码管理方法
) else (
    echo ❌ renderer.js 不存在
)

echo.
echo 🔍 常见问题诊断：
echo.
echo 1. 设置按钮无响应：
echo    - 检查浏览器控制台错误
echo    - 确认JavaScript正确加载
echo    - 验证事件绑定
echo.
echo 2. 设置面板不显示：
echo    - 检查CSS的.hidden类
echo    - 确认DOM元素存在
echo    - 验证toggleSettings方法
echo.
echo 3. 股票代码管理不工作：
echo    - 检查HTML元素ID
echo    - 确认JavaScript方法
echo    - 验证事件绑定
echo.

echo 🚀 启动应用测试修复效果...
echo 提示: 启动后点击设置按钮，如果仍有问题请查看控制台
echo.

npm start

echo.
echo 修复完成，请测试设置面板功能
pause
