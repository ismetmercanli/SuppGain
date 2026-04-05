param(
    [Parameter(Mandatory = $true)]
    [string]$DumpFile,

    [Parameter(Mandatory = $true)]
    [string]$CloudHost,

    [int]$CloudPort = 5432,

    [Parameter(Mandatory = $true)]
    [string]$CloudDatabase,

    [Parameter(Mandatory = $true)]
    [string]$CloudUser,

    [Parameter(Mandatory = $true)]
    [string]$CloudPassword,

    [string]$SslMode = "require"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $DumpFile)) {
    throw "Dump file not found: $DumpFile"
}

$resolvedDump = (Resolve-Path $DumpFile).Path
$dumpDir = Split-Path -Parent $resolvedDump
$dumpName = Split-Path -Leaf $resolvedDump

Write-Host "Restoring '$dumpName' to cloud DB '$CloudDatabase' at ${CloudHost}:$CloudPort ..."

docker run --rm `
    -e "PGPASSWORD=$CloudPassword" `
    -e "PGSSLMODE=$SslMode" `
    -v "${dumpDir}:/work" `
    postgres:16 `
    psql -h $CloudHost -p $CloudPort -U $CloudUser -d $CloudDatabase -v ON_ERROR_STOP=1 -f "/work/$dumpName"

if ($LASTEXITCODE -ne 0) {
    throw "Restore failed."
}

Write-Host "Restore completed successfully."
