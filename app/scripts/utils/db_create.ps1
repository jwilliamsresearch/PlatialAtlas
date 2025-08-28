Param(
  [string]$DatabaseUrl = $env:DATABASE_URL
)

if (-not $DatabaseUrl) {
  Write-Error "DATABASE_URL not set"
  exit 1
}

try {
  $uri = [System.Uri]$DatabaseUrl
} catch {
  Write-Error "Invalid DATABASE_URL: $DatabaseUrl"
  exit 1
}

$userinfo = $uri.UserInfo.Split(':')
$pguser = if ($userinfo.Length -ge 1) { $userinfo[0] } else { "postgres" }
$pgpass = if ($userinfo.Length -ge 2) { $userinfo[1] } else { "" }
$pghost = $uri.Host
$pgport = if ($uri.Port -gt 0) { $uri.Port } else { 5432 }
$dbname = $uri.AbsolutePath.TrimStart('/')

$env:PGUSER = $pguser
if ($pgpass) { $env:PGPASSWORD = $pgpass }
$env:PGHOST = $pghost
$env:PGPORT = "$pgport"

$exists = & psql -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$dbname'" 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "psql connection failed. Ensure PostgreSQL is running and your credentials are correct."
  exit 1
}

if ($exists -match '1') {
  Write-Host "DB exists"
} else {
& psql -d postgres -c "CREATE DATABASE ""$dbname""" | Out-Null
  Write-Host "Created database $dbname"
}
