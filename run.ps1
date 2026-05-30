# Запуск бэкенда и фронта (порт 3003)
# Запускай из папки, где лежат Backend и "Front end": .\run.ps1

$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

$backendPath = Join-Path $root "Backend"
$frontPath  = Join-Path $root "Front end"

if (-not (Test-Path (Join-Path $backendPath "package.json"))) {
    Write-Host "Ошибка: в $root не найдены папки Backend и Front end. Запускай run.ps1 из папки Diplomka." -ForegroundColor Red
    exit 1
}

Write-Host "Backend (port 3003)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -LiteralPath '$backendPath'; npm run dev"

Start-Sleep -Seconds 2

Write-Host "Front end..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -LiteralPath '$frontPath'; npm run dev"

Write-Host ""
Write-Host "Окна открыты. Сайт: http://localhost:5173   API: http://localhost:3003/api" -ForegroundColor Yellow
