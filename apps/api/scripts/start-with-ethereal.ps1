$env:SMTP_HOST='smtp.ethereal.email'
$env:SMTP_PORT='587'
$env:SMTP_USER='wtjp7zvojqdmlqxz@ethereal.email'
$env:SMTP_PASS='Z6R1F16krX2R2q7Dgs'
$env:MAIL_FROM='wtjp7zvojqdmlqxz@ethereal.email'
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location ..

npm run dev 2>&1 | Tee-Object -FilePath .\api-dev.log
