# Server cho Võ Lâm Idle offline - chay tren localhost, khong can admin
$root = 'E:\JXcod\volamidle-offline'
$port = if ($args.Count -gt 0) { $args[0] } else { 8765 }

$mime = @{
  '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='application/javascript; charset=utf-8'
  '.json'='application/json; charset=utf-8'; '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'
  '.gif'='image/gif'; '.webp'='image/webp'; '.svg'='image/svg+xml'; '.ico'='image/x-icon'
  '.woff2'='font/woff2'; '.woff'='font/woff'; '.ttf'='font/ttf'; '.otf'='font/otf'
  '.mp3'='audio/mpeg'; '.ogg'='audio/ogg'; '.wav'='audio/wav'; '.m4a'='audio/mp4'
  '.txt'='text/plain; charset=utf-8'; '.xml'='application/xml'; '.webmanifest'='application/manifest+json'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try { $listener.Start() } catch {
  $port = 8766
  $listener.Prefixes.Clear()
  $listener.Prefixes.Add("http://localhost:$port/")
  $listener.Start()
}
$url = "http://localhost:$port/"
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'server_url.txt'), $url)
Write-Output "Dang chay: $url (bam Ctrl+C de dung)"

while ($listener.IsListening) {
  $ctx = $null
  try {
    $ctx = $listener.GetContext()
    $p = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
    if ($p -eq '/' -or $p -eq '') { $p = '/index.html' }
    $file = Join-Path $root ($p.TrimStart('/') -replace '/', '\')
    # chan phia ngoai root
    if (-not $file.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) {
      $ctx.Response.StatusCode = 403
    }
    elseif (Test-Path $file -PathType Leaf) {
      $bytes = [IO.File]::ReadAllBytes($file)
      $ext = [IO.Path]::GetExtension($file).ToLower()
      $ctx.Response.ContentType = $(if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' })
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.Headers.Add('Cache-Control', 'no-cache')
      if ($ctx.Request.HttpMethod -ne 'HEAD') { $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length) }
    } else {
      $ctx.Response.StatusCode = 404
      if ($ctx.Request.HttpMethod -ne 'HEAD') {
        $buf = [Text.Encoding]::UTF8.GetBytes('404')
        $ctx.Response.OutputStream.Write($buf, 0, $buf.Length)
      }
    }
  } catch { } finally { if ($ctx) { try { $ctx.Response.Close() } catch { } } }
}
