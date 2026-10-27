$services = @(
    @{ Name = "Frontend Portal"; Port = 5173 },
    @{ Name = "Eureka Server"; Port = 8761 },
    @{ Name = "API Gateway"; Port = 8099 },
    @{ Name = "registration-service"; Port = 8081 },
    @{ Name = "admission-service"; Port = 8082 },
    @{ Name = "student-enquire-service"; Port = 8083 },
    @{ Name = "parent-enquiry-service"; Port = 8084 },
    @{ Name = "admin-enquiries-service"; Port = 8085 },
    @{ Name = "admin-admissions-service"; Port = 8086 },
    @{ Name = "teacher-enquiry-service"; Port = 8087 },
    @{ Name = "staff-enquiry-service"; Port = 8088 },
    @{ Name = "teacher-lesson-notes-service"; Port = 8089 },
    @{ Name = "student-portal-service"; Port = 8090 },
    @{ Name = "teacher-portal-service"; Port = 8091 },
    @{ Name = "staff-portal-service"; Port = 8092 },
    @{ Name = "staff-student-service"; Port = 8093 },
    @{ Name = "teacher-attendance-service"; Port = 8094 },
    @{ Name = "student-schedule-service"; Port = 8095 },
    @{ Name = "staff-examination-service"; Port = 8096 },
    @{ Name = "student-assignment-service"; Port = 8097 },
    @{ Name = "student-examination-service"; Port = 8098 },
    @{ Name = "student-study-resource-service"; Port = 8100 },
    @{ Name = "parent-profile-service"; Port = 8101 },
    @{ Name = "parent-child-academic-service"; Port = 8102 }
)

$activeConns = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue
$activePorts = $activeConns | Select-Object -ExpandProperty LocalPort -Unique

$upCount = 0
foreach ($s in $services) {
    if ($activePorts -contains $s.Port) {
        Write-Host ("[ONLINE ] " + $s.Name.PadRight(32) + " Port " + $s.Port) -ForegroundColor Green
        $upCount++
    } else {
        Write-Host ("[STARTING] " + $s.Name.PadRight(32) + " Port " + $s.Port) -ForegroundColor Yellow
    }
}

Write-Host "`nSummary: $upCount / $($services.Count) services are ONLINE and LISTENING." -ForegroundColor Cyan
