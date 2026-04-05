param(
    [string]$ContainerName = "suppgain-postgres",
    [string]$DatabaseName = "suppgain",
    [string]$DbUser = "postgres",
    [string]$OutputFile = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($OutputFile)) {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $OutputFile = "db-backup-$($DatabaseName)-$timestamp.sql"
}

Write-Host "Checking Docker container: $ContainerName"
$runningContainers = docker ps --format "{{.Names}}"
if (-not ($runningContainers -split "`r?`n" | Where-Object { $_ -eq $ContainerName })) {
    throw "Container '$ContainerName' is not running."
}

Write-Host "Exporting database '$DatabaseName' from container '$ContainerName'..."
docker exec $ContainerName pg_dump -U $DbUser -d $DatabaseName --clean --if-exists --no-owner --no-privileges > $OutputFile

if (-not (Test-Path $OutputFile)) {
    throw "Dump file was not created."
}

$sizeKb = [math]::Round((Get-Item $OutputFile).Length / 1KB, 2)
Write-Host "Done. Dump file: $OutputFile ($sizeKb KB)"
