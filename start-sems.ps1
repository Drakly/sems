# PowerShell script to start SEMS Application
Write-Host "=== Starting SEMS Application ===" -ForegroundColor Green

# Step 1: Start infrastructure services with Docker Compose
Write-Host "Starting infrastructure services with Docker..." -ForegroundColor Yellow
docker-compose up -d mysql mongodb elasticsearch redis zookeeper kafka prometheus grafana

# Initialize databases and create Kafka topics
Write-Host "Initializing databases and Kafka topics..." -ForegroundColor Yellow
if (Test-Path "init-databases.sh") {
    wsl ./init-databases.sh
} else {
    Write-Host "init-databases.sh not found, skipping..." -ForegroundColor Red
}

# Step 2: Start discovery and config server
Write-Host "Starting Discovery Server..." -ForegroundColor Yellow
Set-Location discovery-server
$discoveryProcess = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run", "-Dspring-boot.run.profiles=local" -PassThru -WindowStyle Hidden
Set-Location ..

Write-Host "Waiting for Discovery Server to start..." -ForegroundColor Yellow
do {
    Start-Sleep -Seconds 5
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8761/actuator/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
        $isUp = $response.Content -like "*UP*"
    } catch {
        $isUp = $false
        Write-Host "Discovery Server not ready yet, waiting..." -ForegroundColor Yellow
    }
} while (-not $isUp)
Write-Host "Discovery Server is running." -ForegroundColor Green

Write-Host "Starting Config Server..." -ForegroundColor Yellow
Set-Location config-server
$configProcess = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run", "-Dspring-boot.run.profiles=composite" -PassThru -WindowStyle Hidden
Set-Location ..

Write-Host "Waiting for Config Server to start..." -ForegroundColor Yellow
do {
    Start-Sleep -Seconds 5
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8888/actuator/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
        $isUp = $response.Content -like "*UP*"
    } catch {
        $isUp = $false
        Write-Host "Config Server not ready yet, waiting..." -ForegroundColor Yellow
    }
} while (-not $isUp)
Write-Host "Config Server is running." -ForegroundColor Green

# Step 3: Start core services
Write-Host "Starting User Service..." -ForegroundColor Yellow
Set-Location user-service
$userProcess = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run", "-Dspring-boot.run.profiles=local" -PassThru -WindowStyle Hidden
Set-Location ..

Write-Host "Starting Expense Service..." -ForegroundColor Yellow
Set-Location expense-service
$expenseProcess = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run", "-Dspring-boot.run.profiles=local" -PassThru -WindowStyle Hidden
Set-Location ..

Write-Host "Starting Document Service..." -ForegroundColor Yellow
Set-Location document-service
$documentProcess = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run", "-Dspring-boot.run.profiles=local" -PassThru -WindowStyle Hidden
Set-Location ..

Write-Host "Starting Notification Service..." -ForegroundColor Yellow
Set-Location notification-service
$notificationProcess = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run", "-Dspring-boot.run.profiles=local" -PassThru -WindowStyle Hidden
Set-Location ..

Write-Host "Starting Reporting Service..." -ForegroundColor Yellow
Set-Location reporting-service
$reportingProcess = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run", "-Dspring-boot.run.profiles=local" -PassThru -WindowStyle Hidden
Set-Location ..

Write-Host "Starting Integration Service..." -ForegroundColor Yellow
Set-Location integration-service
$integrationProcess = Start-Process -FilePath "python" -ArgumentList "-m", "app.main" -PassThru -WindowStyle Hidden
Set-Location ..

# Step 4: Finally, start the gateway
Write-Host "Waiting for services to be registered..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

Write-Host "Starting Gateway Service..." -ForegroundColor Yellow
Set-Location gateway-service
$gatewayProcess = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run", "-Dspring-boot.run.profiles=local" -PassThru -WindowStyle Hidden
Set-Location ..

Write-Host "=== All services started ===" -ForegroundColor Green
Write-Host "=== SEMS Application is running ===" -ForegroundColor Green
Write-Host "To stop the application, run: .\stop-sems.ps1" -ForegroundColor Yellow

# Save PIDs to file for the stop script
@"
DISCOVERY_PID=$($discoveryProcess.Id)
CONFIG_PID=$($configProcess.Id)
USER_PID=$($userProcess.Id)
EXPENSE_PID=$($expenseProcess.Id)
DOCUMENT_PID=$($documentProcess.Id)
NOTIFICATION_PID=$($notificationProcess.Id)
REPORTING_PID=$($reportingProcess.Id)
INTEGRATION_PID=$($integrationProcess.Id)
GATEWAY_PID=$($gatewayProcess.Id)
"@ | Out-File -FilePath ".sems-pids" -Encoding UTF8

Write-Host "Access the application at: http://localhost:8080" -ForegroundColor Green
Write-Host "Access Eureka at: http://localhost:8761" -ForegroundColor Green
Write-Host "Access Grafana at: http://localhost:3000 (admin/admin)" -ForegroundColor Green

Write-Host "Press Ctrl+C to stop all services..." -ForegroundColor Yellow

# Keep script running and wait for user interrupt
try {
    while ($true) {
        Start-Sleep -Seconds 10
    }
} finally {
    Write-Host "Stopping services..." -ForegroundColor Red
    # The stop script will handle cleanup
}
