# Освободить порт 3003 (завершить процесс, который его слушает)
$port = 3003
$conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
if ($conn) {
  $processId = $conn.OwningProcess
  Stop-Process -Id $processId -Force
  Write-Host "Процесс $processId на порту $port завершён." -ForegroundColor Green
} else {
  Write-Host "Порт $port свободен." -ForegroundColor Yellow
}
