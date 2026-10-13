$LogDir = Join-Path $PSScriptRoot "logs"
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

$jvmArgs = "-Xms64m -Xmx220m -XX:TieredStopAtLevel=1"
$mvnArgs = "spring-boot:run -DskipTests -Dspring-boot.run.jvmArguments=`"$jvmArgs`""

Write-Host "Starting student-examination-service on port 8098..."
$logOut1 = Join-Path $LogDir "student-examination-service-out.log"
$logErr1 = Join-Path $LogDir "student-examination-service-err.log"
Start-Process -FilePath "mvn.cmd" -ArgumentList $mvnArgs -WorkingDirectory (Join-Path $PSScriptRoot "backend\student-examination-service") -NoNewWindow -RedirectStandardOutput $logOut1 -RedirectStandardError $logErr1

Write-Host "Starting api-gateway on port 8099..."
$logOut2 = Join-Path $LogDir "api-gateway-out.log"
$logErr2 = Join-Path $LogDir "api-gateway-err.log"
Start-Process -FilePath "mvn.cmd" -ArgumentList $mvnArgs -WorkingDirectory (Join-Path $PSScriptRoot "backend\api-gateway") -NoNewWindow -RedirectStandardOutput $logOut2 -RedirectStandardError $logErr2

Write-Host "Waiting for services to initialize..."
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 2
    $p8098 = Get-NetTCPConnection -LocalPort 8098 -State Listen -ErrorAction SilentlyContinue
    $p8099 = Get-NetTCPConnection -LocalPort 8099 -State Listen -ErrorAction SilentlyContinue
    if ($p8098 -and $p8099) {
        Write-Host "Both student-examination-service and api-gateway are listening!" -ForegroundColor Green
        break
    }
}

while ($true) {
    Start-Sleep -Seconds 3600
}
