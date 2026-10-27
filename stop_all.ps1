Write-Host "Stopping all Smart Attendance Management services..." -ForegroundColor Cyan

# Stop Docker Compose containers if active
$dockerStatus = docker info 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Stopping Docker containers..." -ForegroundColor Yellow
    docker compose down
}

# Stop native processes listening on project ports
$ports = @(8761, 8099, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089, 8090, 8091, 8092, 8093, 8094, 8095, 8096, 8097, 8098, 8100, 8101, 8102, 5173)

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -gt 0 }
        foreach ($p in $pids) {
            try {
                $proc = Get-Process -Id $p -ErrorAction SilentlyContinue
                if ($proc) {
                    Write-Host "Stopping process $($proc.Name) (PID: $p) on port $port..." -ForegroundColor Yellow
                    Stop-Process -Id $p -Force
                }
            } catch {
                Write-Host "Failed to stop process on port $port (PID: $p): $_" -ForegroundColor Red
            }
        }
    }
}

Write-Host "All services stopped." -ForegroundColor Green
