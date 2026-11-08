@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 猫城来信手机局域网试玩
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /R /C:"IPv4 Address" /C:"IPv4 地址"') do echo 请让手机与电脑连接同一 Wi-Fi，然后打开：http://%%A:4173/?fresh=1^&v=mobile
where python >nul 2>&1
if errorlevel 1 (echo 未检测到 Python，无法启动本地服务。& pause&exit /b 1)
python -m http.server 4173 --bind 0.0.0.0
