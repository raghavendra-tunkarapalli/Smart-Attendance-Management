# Create logs directory if it doesn't exist
$LogDir = Join-Path $PSScriptRoot "logs"
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

Write-Host "Starting Smart Attendance Management services..." -ForegroundColor Cyan

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
    @{ Name = "student-assignment-service"; Path = "backend/student-assignment-service"; Port = 8097 }
)

# 1. Start Eureka Server
$eureka = $services | Where-Object { $_.Name -eq "eureka-server" }
Write-Host "Starting $($eureka.Name) on port $($eureka.Port)..." -ForegroundColor Yellow
$eurekaLogOut = Join-Path $LogDir "$($eureka.Name)-out.log"
$eurekaLogErr = Join-Path $LogDir "$($eureka.Name)-err.log"
Start-Process -FilePath "mvn.cmd" -ArgumentList "spring-boot:run -DskipTests" -WorkingDirectory (Join-Path $PSScriptRoot $eureka.Path) -NoNewWindow -RedirectStandardOutput $eurekaLogOut -RedirectStandardError $eurekaLogErr

# Wait for Eureka to be up
Write-Host "Waiting 12 seconds for Eureka Server to initialize..." -ForegroundColor DarkYellow
Start-Sleep -Seconds 12

# 2. Start API Gateway
$gateway = $services | Where-Object { $_.Name -eq "api-gateway" }
Write-Host "Starting $($gateway.Name) on port $($gateway.Port)..." -ForegroundColor Yellow
$gatewayLogOut = Join-Path $LogDir "$($gateway.Name)-out.log"
$gatewayLogErr = Join-Path $LogDir "$($gateway.Name)-err.log"
Start-Process -FilePath "mvn.cmd" -ArgumentList "spring-boot:run -DskipTests" -WorkingDirectory (Join-Path $PSScriptRoot $gateway.Path) -NoNewWindow -RedirectStandardOutput $gatewayLogOut -RedirectStandardError $gatewayLogErr

# Wait for Gateway
Write-Host "Waiting 5 seconds for API Gateway to initialize..." -ForegroundColor DarkYellow
Start-Sleep -Seconds 5

# 3. Start remaining services
foreach ($service in $services) {
    if ($service.Name -eq "eureka-server" -or $service.Name -eq "api-gateway") { continue }
    Write-Host "Starting $($service.Name) on port $($service.Port)..." -ForegroundColor Yellow
    $logFileOut = Join-Path $LogDir "$($service.Name)-out.log"
    $logFileErr = Join-Path $LogDir "$($service.Name)-err.log"
    Start-Process -FilePath "mvn.cmd" -ArgumentList "spring-boot:run -DskipTests" -WorkingDirectory (Join-Path $PSScriptRoot $service.Path) -NoNewWindow -RedirectStandardOutput $logFileOut -RedirectStandardError $logFileErr
    Start-Sleep -Seconds 2 # small gap to avoid high CPU spikes starting multiple maven instances at once
}

# 4. Start frontend
Write-Host "Starting frontend (Vite)..." -ForegroundColor Yellow
$frontendLogOut = Join-Path $LogDir "frontend-out.log"
$frontendLogErr = Join-Path $LogDir "frontend-err.log"
Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory (Join-Path $PSScriptRoot "frontend") -NoNewWindow -RedirectStandardOutput $frontendLogOut -RedirectStandardError $frontendLogErr

Write-Host "All services started! Check the 'logs' folder for logs." -ForegroundColor Green
Write-Host "Eureka Dashboard: http://localhost:8761" -ForegroundColor Green
Write-Host "API Gateway: http://localhost:8099" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green

Write-Host "Keeping launcher process alive to support background services. Use stop_all.ps1 to terminate." -ForegroundColor Cyan
while ($true) {
    Start-Sleep -Seconds 3600
}
