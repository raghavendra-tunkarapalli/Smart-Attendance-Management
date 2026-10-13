param(
    [switch]$NoWait,
    [switch]$Watch
)

# Create logs directory if it doesn't exist
$LogDir = Join-Path $PSScriptRoot "logs"
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Launching Smart Attendance Management Services Quickly   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$jvmArgs = "-Xms64m -Xmx220m -XX:TieredStopAtLevel=1"
$mvnArgs = "spring-boot:run -DskipTests -Dspring-boot.run.jvmArguments=`"$jvmArgs`""

# Service definitions: Name, Path, Port
$services = @(
    @{ Name = "eureka-server"; Path = "backend/eureka-server"; Port = 8761 },
    @{ Name = "api-gateway"; Path = "backend/api-gateway"; Port = 8099 },
    @{ Name = "registration-service"; Path = "backend/registration-service"; Port = 8081 },
    @{ Name = "admission-service"; Path = "backend/admission-service"; Port = 8082 },
    @{ Name = "student-enquire-service"; Path = "backend/student-enquire-service"; Port = 8083 },
    @{ Name = "parent-enquiry-service"; Path = "backend/parent-enquiry-service"; Port = 8084 },
    @{ Name = "admin-enquiries-service"; Path = "backend/admin-enquiries-service"; Port = 8085 },
    @{ Name = "admin-admissions-service"; Path = "backend/admin-admissions-service"; Port = 8086 },
    @{ Name = "teacher-enquiry-service"; Path = "backend/teacher-enquiry-service"; Port = 8087 },
    @{ Name = "staff-enquiry-service"; Path = "backend/staff-enquiry-service"; Port = 8088 },
    @{ Name = "student-portal-service"; Path = "backend/student-portal-service"; Port = 8090 },
    @{ Name = "teacher-portal-service"; Path = "backend/teacher-portal-service"; Port = 8091 },
    @{ Name = "staff-portal-service"; Path = "backend/staff-portal-service"; Port = 8092 },
    @{ Name = "staff-student-service"; Path = "backend/staff-student-service"; Port = 8093 },
    @{ Name = "teacher-attendance-service"; Path = "backend/teacher-attendance-service"; Port = 8094 },
    @{ Name = "student-schedule-service"; Path = "backend/student-schedule-service"; Port = 8095 },
    @{ Name = "staff-examination-service"; Path = "backend/staff-examination-service"; Port = 8096 },
    @{ Name = "student-assignment-service"; Path = "backend/student-assignment-service"; Port = 8097 },
    @{ Name = "student-examination-service"; Path = "backend/student-examination-service"; Port = 8098 },
    @{ Name = "teacher-lesson-notes-service"; Path = "backend/teacher-lesson-notes-service"; Port = 8089 },
    @{ Name = "student-study-resource-service"; Path = "backend/student-study-resource-service"; Port = 8100 }
)

# 1. Start Frontend (Vite) immediately
$feConn = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
if (-not $feConn) {
    Write-Host "[1/3] Starting Frontend (Vite) on port 5173..." -ForegroundColor Green
    $frontendLogOut = Join-Path $LogDir "frontend-out.log"
    $frontendLogErr = Join-Path $LogDir "frontend-err.log"
    Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" -WorkingDirectory (Join-Path $PSScriptRoot "frontend") -NoNewWindow -RedirectStandardOutput $frontendLogOut -RedirectStandardError $frontendLogErr
} else {
    Write-Host "[1/3] Frontend is already running on port 5173." -ForegroundColor DarkGreen
}

# 2. Start Eureka Server immediately
$eurekaConn = Get-NetTCPConnection -LocalPort 8761 -State Listen -ErrorAction SilentlyContinue
if (-not $eurekaConn) {
    Write-Host "[2/3] Starting Eureka Server on port 8761..." -ForegroundColor Yellow
    $eurekaLogOut = Join-Path $LogDir "eureka-server-out.log"
    $eurekaLogErr = Join-Path $LogDir "eureka-server-err.log"
    Start-Process -FilePath "mvn.cmd" -ArgumentList $mvnArgs -WorkingDirectory (Join-Path $PSScriptRoot "backend/eureka-server") -NoNewWindow -RedirectStandardOutput $eurekaLogOut -RedirectStandardError $eurekaLogErr

    Write-Host "Waiting for Eureka Server to listen on port 8761..." -ForegroundColor DarkYellow
    $eurekaWait = 0
    while ($eurekaWait -lt 30) {
        Start-Sleep -Seconds 1
        $eurekaConn = Get-NetTCPConnection -LocalPort 8761 -State Listen -ErrorAction SilentlyContinue
        if ($eurekaConn) { 
            Write-Host "Eureka Server is now ONLINE!" -ForegroundColor Green
            break 
        }
        $eurekaWait++
    }
} else {
    Write-Host "[2/3] Eureka Server is already running on port 8761." -ForegroundColor Green
}

# 3. Start API Gateway and all backend microservices
Write-Host "[3/3] Launching API Gateway and microservices..." -ForegroundColor Cyan
$otherServices = $services | Where-Object { $_.Name -ne "eureka-server" }
foreach ($svc in $otherServices) {
    $existing = Get-NetTCPConnection -LocalPort $svc.Port -State Listen -ErrorAction SilentlyContinue
    if (-not $existing) {
        Write-Host "  -> Spawning $($svc.Name) (: $($svc.Port))..." -ForegroundColor Yellow
        $logOut = Join-Path $LogDir "$($svc.Name)-out.log"
        $logErr = Join-Path $LogDir "$($svc.Name)-err.log"
        Start-Process -FilePath "mvn.cmd" -ArgumentList $mvnArgs -WorkingDirectory (Join-Path $PSScriptRoot $svc.Path) -NoNewWindow -RedirectStandardOutput $logOut -RedirectStandardError $logErr
        Start-Sleep -Milliseconds 450
    } else {
        Write-Host "  -> $($svc.Name) already running (: $($svc.Port))" -ForegroundColor DarkGreen
    }
}

Write-Host "`nAll processes spawned successfully!" -ForegroundColor Green

if ($NoWait) {
    Write-Host "Services are starting up in background. Check 'logs' folder for output." -ForegroundColor Cyan
} else {
    Write-Host "Monitoring service ports for readiness..." -ForegroundColor Cyan
    $maxCheck = 20
    $iteration = 0
    $allPorts = @(8761, 8099, 5173) + ($otherServices | ForEach-Object { $_.Port })

    while ($iteration -lt $maxCheck) {
        Start-Sleep -Seconds 2
        $activeConns = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in $allPorts }
        $activePorts = $activeConns | Select-Object -ExpandProperty LocalPort -Unique
        $readyCount = if ($activePorts) { ($activePorts | Measure-Object).Count } else { 0 }
        $totalCount = $allPorts.Count
        Write-Host "[$([DateTime]::Now.ToString('HH:mm:ss'))] Ready services: $readyCount / $totalCount" -ForegroundColor Cyan
        
        if ($readyCount -ge $totalCount) {
            Write-Host "All $totalCount services are now ONLINE and LISTENING!" -ForegroundColor Green
            break
        }
        $iteration++
    }
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  Smart Attendance Management Services Status             " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Frontend Portal:   http://localhost:5173" -ForegroundColor Green
Write-Host "API Gateway:       http://localhost:8099" -ForegroundColor Green
Write-Host "Eureka Dashboard:  http://localhost:8761" -ForegroundColor Green
Write-Host "Logs Location:     $LogDir" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Green

if (-not $NoWait) {
    Write-Host "Services are running. Launcher will remain active in background." -ForegroundColor Cyan
    while ($true) { Start-Sleep -Seconds 3600 }
}





