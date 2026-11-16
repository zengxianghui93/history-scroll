# 压缩封面图：PNG -> 指定宽度 JPG（用于控制小程序主包体积）
# 用法: powershell -ExecutionPolicy Bypass -File compress_image.ps1 -Src <png路径> -Dst <jpg路径> [-Width 1024] [-Quality 82]
param(
  [Parameter(Mandatory = $true)][string]$Src,
  [Parameter(Mandatory = $true)][string]$Dst,
  [int]$Width = 1024,
  [int]$Quality = 82
)

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($Src)
$h = [int]($img.Height * $Width / $img.Width)
$bmp = New-Object System.Drawing.Bitmap($Width, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = 'HighQualityBicubic'
$g.DrawImage($img, 0, 0, $Width, $h)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
$bmp.Save($Dst, $codec, $ep)
$g.Dispose(); $bmp.Dispose(); $img.Dispose()
'{0} KB  ({1}x{2})' -f [int]((Get-Item $Dst).Length / 1KB), $Width, $h
