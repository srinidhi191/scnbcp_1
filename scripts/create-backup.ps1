$root = "C:\Users\vivek\OneDrive\Desktop\SCNBCP"
Set-Location $root
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$dest = Join-Path $root ("restore-backups\" + $ts)
New-Item -ItemType Directory -Path $dest -Force | Out-Null
# Use robocopy for fast, robust copy; exclude node_modules, .git, and existing restore-backups
robocopy $root $dest /E /XD node_modules restore-backups .git | Out-Null
Write-Output ("BACKUP_CREATED:" + $dest)
