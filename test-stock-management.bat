@echo off
echo 测试股票代码管理功能...
echo.

echo 功能说明:
echo 1. 动态添加股票代码
echo 2. 编辑现有股票代码
echo 3. 删除不需要的股票代码
echo 4. 实时验证股票代码格式
echo 5. 自动保存设置并更新数据
echo.

echo 使用方法:
echo 1. 运行应用: npm start
echo 2. 点击设置按钮打开设置面板
echo 3. 在"股票代码管理"区域:
echo    - 输入新股票代码并点击"+"按钮添加
echo    - 点击编辑按钮修改现有代码
echo    - 点击删除按钮移除不需要的代码
echo 4. 点击"保存设置"应用更改
echo.

echo 支持的股票代码格式:
echo - 000001 (深市主板)
echo - 600000 (沪市主板)  
echo - 300001 (创业板)
echo - 688001 (科创板)
echo.

echo 注意事项:
echo - 股票代码必须是6位数字
echo - 不能重复添加相同的代码
echo - 编辑时支持回车保存，ESC取消
echo - 删除前会有确认提示
echo.

pause
