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
  --set-env-vars DB_HOST="ep-ancient-poetry-azte8dd6-pooler.c-3.ap-southeast-1.aws.neon.tech",DB_PORT="5432",DB_USERNAME="neondb_owner",DB_NAME="neondb"

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "   HOÀN TẤT DEPLOY LIFELINK AI LÊN GOOGLE CLOUD RUN!      " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
