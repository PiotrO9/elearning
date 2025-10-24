# PowerShell script do testowania seed endpoint
# Użycie: .\scripts\test-seed.ps1

$BaseUrl = "http://localhost:3000/api"
$CookieContainer = New-Object System.Net.CookieContainer

Write-Host "🧪 Test Seed Endpoint" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan

# Funkcja do wykonywania requestów z cookies
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Body = $null,
        [System.Net.CookieContainer]$Cookies
    )
    
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $session.Cookies = $Cookies
    
    $params = @{
        Uri = $Url
        Method = $Method
        WebSession = $session
        ContentType = "application/json"
    }
    
    if ($Body) {
        $params.Body = ($Body | ConvertTo-Json)
    }
    
    try {
        $response = Invoke-RestMethod @params
        return @{
            Success = $true
            Data = $response
            Session = $session
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            Session = $session
        }
    }
}

Write-Host ""
Write-Host "1️⃣ Logowanie jako admin..." -ForegroundColor Yellow

$loginBody = @{
    email = "admin@elearning.pl"
    password = "Admin123!"
}

$loginResult = Invoke-ApiRequest -Method "POST" -Url "$BaseUrl/auth/login" -Body $loginBody -Cookies $CookieContainer

if ($loginResult.Success) {
    Write-Host "✅ Zalogowano pomyślnie" -ForegroundColor Green
    $CookieContainer = $loginResult.Session.Cookies
} else {
    Write-Host "❌ Błąd logowania - prawdopodobnie użytkownik admin nie istnieje jeszcze" -ForegroundColor Red
    Write-Host "Spróbuj najpierw: npm run db:seed" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "2️⃣ Wywołanie seed endpoint..." -ForegroundColor Yellow

$seedResult = Invoke-ApiRequest -Method "POST" -Url "$BaseUrl/seed" -Cookies $CookieContainer

if ($seedResult.Success) {
    Write-Host "✅ Seedowanie zakończone pomyślnie" -ForegroundColor Green
    Write-Host ($seedResult.Data | ConvertTo-Json -Depth 5)
    $CookieContainer = $seedResult.Session.Cookies
} else {
    Write-Host "❌ Błąd podczas seedowania" -ForegroundColor Red
    Write-Host $seedResult.Error -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3️⃣ Test logowania nowym użytkownikiem admin..." -ForegroundColor Yellow

$CookieContainer = New-Object System.Net.CookieContainer
$testLoginResult = Invoke-ApiRequest -Method "POST" -Url "$BaseUrl/auth/login" -Body $loginBody -Cookies $CookieContainer

if ($testLoginResult.Success) {
    Write-Host "✅ Nowy admin działa poprawnie" -ForegroundColor Green
} else {
    Write-Host "❌ Nie można zalogować się nowym adminem" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✨ Wszystkie testy przeszły pomyślnie!" -ForegroundColor Green

