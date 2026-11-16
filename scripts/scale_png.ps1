# 缩放 PNG 并保持透明通道（用于 tabBar 小图标）
# 用法: powershell -ExecutionPolicy Bypass -File scale_png.ps1 -Src <png> -Dst <png> -Size 81
param(
  [Parameter(Mandatory = $true)][string]$Src,
  [Parameter(Mandatory = $true)][string]$Dst,
  [int]$Size = 81
)

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($Src)
$bmp = New-Object System.Drawing.Bitmap($Size, $Size)
$bmp.MakeTransparent()
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = 'HighQualityBicubic'
$g.SmoothingMode = 'HighQuality'
$g.Clear([System.Drawing.Color]::Transparent)
$g.DrawImage($img, 0, 0, $Size, $Size)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/png' }
$bmp.Save($Dst, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose(); $img.Dispose()
'OK {0} ({1}x{1})' -f $Dst, $Size
