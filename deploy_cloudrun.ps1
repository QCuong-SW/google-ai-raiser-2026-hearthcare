# LifeLink AI - Google Cloud Run Automated Deployment Script
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "   LIFELINK AI - GOOGLE CLOUD RUN AUTOMATED DEPLOYMENT   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

# 1. Check gcloud CLI
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "`n[!] Google Cloud SDK (gcloud CLI) chưa được cài đặt trên máy của bạn." -ForegroundColor Yellow
    Write-Host "    Vui lòng tải và cài đặt gcloud CLI tại: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    Write-Host "    Sau khi cài đặt, hãy mở lại PowerShell và chạy lại script này." -ForegroundColor Yellow
    exit 1
}

# Read variables from server/.env if available
$envFile = "server/.env"
$envVars = @{}
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#=]+)\s*=\s*(.*)\s*$') {
            $envVars[$matches[1].Trim()] = $matches[2].Trim()
        }
    }
}

$dbHost = $envVars['DB_HOST']
$dbPort = $envVars['DB_PORT']
$dbUser = $envVars['DB_USERNAME']
$dbPass = $envVars['DB_PASSWORD']
$dbName = $envVars['DB_NAME']
$geminiKey = $envVars['GEMINI_API_KEY']
$smtpUser = $envVars['SMTP_USER']
$smtpPass = $envVars['SMTP_PASS']
$googleClient = $envVars['GOOGLE_CLIENT_ID']

# 2. Login & Project Selection
Write-Host "`n[1/3] Đăng nhập Google Cloud..." -ForegroundColor Green
gcloud auth login

$projectId = Read-Host "`n[?] Nhập ID Dự Án Google Cloud của bạn (Google Cloud Project ID)"
if ([string]::IsNullOrWhiteSpace($projectId)) {
    Write-Host "[!] Project ID không được để trống." -ForegroundColor Red
    exit 1
}

gcloud config set project $projectId

# 3. Build & Submit Docker Image
Write-Host "`n[2/3] Đóng gói và tải Docker Image lên Google Cloud Registry..." -ForegroundColor Green
gcloud builds submit --tag "gcr.io/$projectId/lifelink-ai:latest"

# 4. Deploy to Cloud Run
Write-Host "`n[3/3] Triển khai dịch vụ lên Google Cloud Run..." -ForegroundColor Green
gcloud run deploy lifelink-ai `
  --image "gcr.io/$projectId/lifelink-ai:latest" `
  --platform managed `
  --region asia-southeast1 `
  --allow-unauthenticated `
  --set-env-vars "DB_HOST=$dbHost,DB_PORT=$dbPort,DB_USERNAME=$dbUser,DB_PASSWORD=$dbPass,DB_NAME=$dbName,GEMINI_API_KEY=$geminiKey,SMTP_HOST=smtp.gmail.com,SMTP_PORT=587,SMTP_USER=$smtpUser,SMTP_PASS=$smtpPass,GOOGLE_CLIENT_ID=$googleClient,JWT_SECRET=lifelink_super_secret_jwt_key_2026"

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "   HOÀN TẤT DEPLOY LIFELINK AI LÊN GOOGLE CLOUD RUN!      " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
