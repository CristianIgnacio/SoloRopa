# start.ps1
# Forzar a la terminal a usar UTF-8 para leer bien las "ñ" y tildes
[console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Iniciando SoloRopa con pestañas..." -ForegroundColor Cyan

# Usamos Windows Terminal (wt) para abrir nuevas terminales en la ventana actual (-w 0) 
# o en una nueva ventana si se hace doble clic.

wt -w 0 new-tab --title "SoloRopa Backend" -d backend powershell -NoExit -Command "npm run dev" `; new-tab --title "SoloRopa Frontend" -d frontend powershell -NoExit -Command "npm run dev"

Write-Host "¡Pestañas abiertas con éxito!" -ForegroundColor Green
