@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo Backend (port 3003)...
start "Backend" cmd /k "cd /d \"%~dp0Backend\" && npm run dev"

timeout /t 2 /nobreak >nul

echo Front end...
start "Front end" cmd /k "cd /d \"%~dp0Front end\" && npm run dev"

echo.
echo Окна открыты. Сайт: http://localhost:5173   API: http://localhost:3003/api
pause
