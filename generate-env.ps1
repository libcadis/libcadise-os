#!/usr/bin/env pwsh
# ============================================================
# Script para generar ADMIN_TOKEN seguro
# Uso: .\generate-env.ps1
# ============================================================

Write-Host "🔐 Generador de ADMIN_TOKEN Seguro" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Generar UUID
$uuid = [guid]::NewGuid().ToString("N")
Write-Host "✅ ADMIN_TOKEN generado:" -ForegroundColor Green
Write-Host $uuid -ForegroundColor Yellow
Write-Host ""

# Copiar al clipboard
$uuid | Set-Clipboard
Write-Host "📋 Copiado al portapapeles!" -ForegroundColor Green
Write-Host ""

# Pedir el Service Role Key
Write-Host "📍 Próximo paso: Obtener SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Cyan
Write-Host "1. Ve a https://app.supabase.com" -ForegroundColor Gray
Write-Host "2. Settings > API > Copia 'Service role secret'" -ForegroundColor Gray
Write-Host "3. Pégalo en el .env.local" -ForegroundColor Gray
Write-Host ""

# Ver si ya existe .env.local
$envPath = "papeleria-ultra.-main\.env.local"
if (Test-Path $envPath) {
    Write-Host "ℹ️  El archivo .env.local ya existe" -ForegroundColor Blue
    Write-Host "Ubicación: $((Get-Item $envPath).FullName)" -ForegroundColor Blue
} else {
    Write-Host "⚠️  No se encontró .env.local - va a ser creado automáticamente" -ForegroundColor Yellow
}
