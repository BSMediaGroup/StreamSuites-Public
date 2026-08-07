$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$port = 8765
$url = "http://127.0.0.1:$port/?demo=operational"
Start-Process $url
python -m http.server $port --bind 127.0.0.1
