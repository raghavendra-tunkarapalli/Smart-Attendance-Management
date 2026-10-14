param(
    [switch]$Build,
    [switch]$Rebuild
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Launching Smart Attendance Management via Docker Compose " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Ensure backend JARs are packaged for instant Docker image builds and layer caching
$missingJars = 0
Get-ChildItem -Path "backend" -Directory | ForEach-Object {
    $pom = Join-Path $_.FullName "pom.xml"
    if (Test-Path $pom) {
        $jar = Get-ChildItem -Path (Join-Path $_.FullName "target") -Filter "*-SNAPSHOT.jar" -ErrorAction SilentlyContinue
        if (-not $jar) { $missingJars++ }
    }
}

if ($missingJars -gt 0 -or $Rebuild) {
    Write-Host "[1/3] Packaging backend services in parallel (-T 1C)..." -ForegroundColor Yellow
    mvn -f backend/pom.xml package -DskipTests -T 1C
} else {
    Write-Host "[1/3] Pre-packaged backend JARs are present. Skipping unnecessary rebuild." -ForegroundColor Green
}

# 2. Check Docker daemon availability
Write-Host "[2/3] Checking Docker daemon status..." -ForegroundColor Cyan
$null = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Docker daemon is currently not running or inaccessible." -ForegroundColor Red
    Write-Host "    Please ensure Docker Desktop is open and running." -ForegroundColor Yellow
    Write-Host "    Tip: You can also run '.\run_all.ps1' for instant native startup." -ForegroundColor Cyan
    exit 1
}

# 3. Start services with Docker Compose
Write-Host "[3/3] Starting all services with Docker Compose..." -ForegroundColor Green
if ($Build -or $Rebuild) {
    docker compose up -d --build
} else {
    docker compose up -d
}

Write-Host "`nAll containers dispatched via Docker Compose!" -ForegroundColor Green
Write-Host "Container Status: docker compose ps" -ForegroundColor Cyan
Write-Host "Frontend Portal:  http://localhost:5173" -ForegroundColor Green
Write-Host "API Gateway:      http://localhost:8099" -ForegroundColor Green
Write-Host "Eureka Dashboard: http://localhost:8761" -ForegroundColor Green
