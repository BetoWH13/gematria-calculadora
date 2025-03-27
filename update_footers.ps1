$files = Get-ChildItem -Path . -Filter "*.html" -Exclude "politica-privacidad.html"

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if the file already has the privacy policy link
    if ($content -notmatch 'politica-privacidad.html') {
        # Check if it has the footer links div
        if ($content -match '<div class="footer-links">[\s\S]*?</div>') {
            $footerLinks = $Matches[0]
            # Check if it already has the legal notice link
            if ($footerLinks -match '<a href="aviso-legal.html">Aviso Legal</a>') {
                # Add the privacy policy link after the legal notice link
                $newFooterLinks = $footerLinks -replace '<a href="aviso-legal.html">Aviso Legal</a>', '<a href="aviso-legal.html">Aviso Legal</a>' + "`n      " + '<a href="politica-privacidad.html">Política de Privacidad</a>'
                $newContent = $content -replace [regex]::Escape($footerLinks), $newFooterLinks
                
                # Write the updated content back to the file
                Set-Content -Path $file.FullName -Value $newContent
                
                Write-Host "Updated footer in $($file.Name)"
            } else {
                Write-Host "No legal notice link found in $($file.Name)"
            }
        } else {
            Write-Host "No footer links div found in $($file.Name)"
        }
    } else {
        Write-Host "Privacy policy link already exists in $($file.Name)"
    }
}

Write-Host "All footers have been updated!"
