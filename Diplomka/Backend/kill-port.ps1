# Освободить порт 3003 (завершить процесс, который его слушает)
$port = 3003
$conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1
if ($conn) {
  $pid = $conn.OwningProcess
  Stop-Process -Id $pid -Force
  Write-Host "Процесс $pid на порту $port завершён." -ForegroundColor Green
} else {
  Write-Host "Порт $port свободен." -ForegroundColor Yellow
}
