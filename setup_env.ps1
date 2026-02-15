
Write-Host "🛠️ Alti.Code.Studio Environment Setup" -ForegroundColor Cyan
Write-Host "========================================"

function Check-Command($cmd) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        Write-Host "✅ $cmd is installed." -ForegroundColor Green
        return $true
    }
    Write-Host "❌ $cmd is NOT installed." -ForegroundColor Red
    return $false
}

# 1. Check/Install Package Manager
$hasChoco = Check-Command "choco"
$hasScoop = Check-Command "scoop"

if (-not $hasChoco -and -not $hasScoop) {
    Write-Host "⚠️ No package manager found. Installing Scoop..." -ForegroundColor Yellow
    Invoke-Expression (New-Object System.Net.WebClient).DownloadString('https://get.scoop.sh')
    $hasScoop = $true
}

# 2. Install Go
if (-not (Check-Command "go")) {
    Write-Host "⬇️ Installing Go..." -ForegroundColor Cyan
    if ($hasChoco) { choco install golang -y }
    elseif ($hasScoop) { scoop install go }
    Write-Host "✅ Go installed. You may need to restart your terminal."
}

# 3. Install Docker
if (-not (Check-Command "docker")) {
    Write-Host "⬇️ Installing Docker Desktop..." -ForegroundColor Cyan
    if ($hasChoco) { choco install docker-desktop -y }
    elseif ($hasScoop) { 
        Write-Host "⚠️ Scoop cannot install Docker Desktop easily. Please download from https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    }
    Write-Host "⏳ Docker installed. Please Start Docker Desktop and wait for the engine to initialization."
}

Write-Host "`n🎉 Setup script functionality complete."
Write-Host "👉 Please RESTART your terminal/PC to ensure PATH updates take effect."
Write-Host "👉 Ensure Docker Desktop is RUNNING before testing 'check_docker.js' again."
Write-Host "👉 Once ready, the system will automatically switch from Mock Mode to Real Mode."
