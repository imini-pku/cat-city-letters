@echo off
chcp 65001 >nul
cd /d "%~dp0"
where python >nul 2>&1
if %errorlevel%==0 (
  start "猫城来信本地服务" /min cmd /c "python -m http.server 4173 --bind 127.0.0.1"
  timeout /t 1 /nobreak >nul
  start "猫城来信 Demo" "http://127.0.0.1:4173/"
) else (
  echo 未检测到 Python，将直接打开离线页面。
  start "猫城来信 Demo" "%~dp0index.html"
)
