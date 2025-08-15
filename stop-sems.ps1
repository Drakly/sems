# PowerShell script to stop SEMS Application
Write-Host "=== Stopping SEMS Application ===" -ForegroundColor Red

# Read PIDs from file
if (Test-Path ".sems-pids") {
    $pids = Get-Content ".sems-pids"
    
    foreach ($line in $pids) {
        if ($line -match "(.+)_PID=(\d+)") {
            $serviceName = $matches[1]
            $pid = $matches[2]
            
            try {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "Stopping $serviceName (PID: $pid)..." -ForegroundColor Yellow
                    Stop-Process -Id $pid -Force
                    Write-Host "$serviceName stopped." -ForegroundColor Green
                } else {
                    Write-Host "$serviceName (PID: $pid) is not running." -ForegroundColor Gray
                }
            } catch {
                Write-Host "Error stopping $serviceName (PID: $pid): $_" -ForegroundColor Red
            }
        }
    }
    
    # Remove the PID file
    Remove-Item ".sems-pids" -ErrorAction SilentlyContinue
} else {
    Write-Host "No PID file found. Attempting to stop services by name..." -ForegroundColor Yellow
    
    # Try to stop Java processes that might be SEMS services
    $javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
    foreach ($proc in $javaProcesses) {
        # Skip the IDE Java process (it has a different command line)
        $commandLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
        if ($commandLine -notlike "*redhat.java*" -and $commandLine -notlike "*eclipse*") {
            Write-Host "Stopping Java process (PID: $($proc.Id))..." -ForegroundColor Yellow
            Stop-Process -Id $proc.Id -Force
        }
    }
    
    # Stop Python processes that might be the integration service
    $pythonProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue
    foreach ($proc in $pythonProcesses) {
        $commandLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
        if ($commandLine -like "*app.main*") {
            Write-Host "Stopping Integration Service (PID: $($proc.Id))..." -ForegroundColor Yellow
            Stop-Process -Id $proc.Id -Force
        }
    }
}

# Stop Docker containers
Write-Host "Stopping Docker containers..." -ForegroundColor Yellow
docker-compose down

Write-Host "=== SEMS Application stopped ===" -ForegroundColor Green
