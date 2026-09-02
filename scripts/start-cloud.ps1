$root = Split-Path -Parent $PSScriptRoot
$nodeDir = Join-Path $root '.runtime\node22'
$node = Join-Path $nodeDir 'node.exe'
$cf = Join-Path $root '.runtime\cloudflared.exe'
$backend = Join-Path $root 'backend'

if (-not (Test-Path $node)) { Write-Host 'Missing .runtime\node22\ — redownload Node 22 portable.'; exit 1 }
if (-not (Test-Path $cf))  { Write-Host 'Missing .runtime\cloudflared.exe — redownload cloudflared.'; exit 1 }

$env:PATH = $nodeDir + ';' + $env:PATH
$env:PORT = '4000'

Start-Process $node -ArgumentList 'start.js' -WorkingDirectory $backend -WindowStyle Minimized
Write-Host 'CYCLONE backend started on http://localhost:4000  (minimized window)'
Start-Sleep -Seconds 6

Write-Host ''
Write-Host 'Opening Cloudflare tunnel. Copy the https://....trycloudflare.com URL:'
Write-Host ''
& $cf tunnel --url http://localhost:4000 --no-autoupdate