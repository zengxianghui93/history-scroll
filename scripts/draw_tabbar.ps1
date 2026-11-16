# 绘制 tabBar 线条图标（透明背景，单色），覆盖 AI 生成不可靠的透明问题
# 用法: powershell -ExecutionPolicy Bypass -File draw_tabbar.ps1 -Shape <book|compass|cat> -Color <RRGGBB> -Dst <png>
param(
  [Parameter(Mandatory = $true)][string]$Shape,
  [Parameter(Mandatory = $true)][string]$Color,
  [Parameter(Mandatory = $true)][string]$Dst
)

Add-Type -AssemblyName System.Drawing
$col = [System.Drawing.ColorTranslator]::FromHtml('#' + $Color)
$Size = 81
$bmp = New-Object System.Drawing.Bitmap($Size, $Size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'HighQuality'
$g.Clear([System.Drawing.Color]::Transparent)
$pen = New-Object System.Drawing.Pen($col, 5)
$brush = New-Object System.Drawing.SolidBrush($col)

if ($Shape -eq 'book') {
  $ptsL = @([System.Drawing.Point]::new(40,20),[System.Drawing.Point]::new(14,26),[System.Drawing.Point]::new(14,54),[System.Drawing.Point]::new(40,60))
  $ptsR = @([System.Drawing.Point]::new(40,20),[System.Drawing.Point]::new(66,26),[System.Drawing.Point]::new(66,54),[System.Drawing.Point]::new(40,60))
  $g.DrawPolygon($pen, $ptsL)
  $g.DrawPolygon($pen, $ptsR)
  $g.DrawLine($pen, 40, 20, 40, 60)
}
elseif ($Shape -eq 'compass') {
  $g.DrawEllipse($pen, 9, 9, 63, 63)
  $g.DrawLine($pen, 40, 9, 40, 72)
  $g.DrawLine($pen, 9, 40, 72, 40)
  $n = @([System.Drawing.Point]::new(40,13),[System.Drawing.Point]::new(32,40),[System.Drawing.Point]::new(48,40))
  $s = @([System.Drawing.Point]::new(40,68),[System.Drawing.Point]::new(32,40),[System.Drawing.Point]::new(48,40))
  $g.FillPolygon($brush, $n)
  $g.DrawPolygon($pen, $s)
}
else {
  $g.DrawEllipse($pen, 18, 24, 45, 45)
  $g.FillPolygon($brush, @([System.Drawing.Point]::new(18,24),[System.Drawing.Point]::new(28,6),[System.Drawing.Point]::new(38,28)))
  $g.FillPolygon($brush, @([System.Drawing.Point]::new(63,24),[System.Drawing.Point]::new(53,6),[System.Drawing.Point]::new(43,28)))
  $g.FillEllipse($brush, 30, 40, 5, 6)
  $g.FillEllipse($brush, 47, 40, 5, 6)
}

$bmp.Save($Dst, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
'OK ' + $Dst
