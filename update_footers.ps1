$files = Get-ChildItem -Path . -Filter "*.html" -Exclude "aviso-legal.html"

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if the file already has the footer links
    if ($content -notmatch '<a href="aviso-legal.html">Aviso Legal</a>') {
        # Find the footer section and add the links
        if ($content -match '<footer>[\s\S]*?</footer>') {
            $footer = $Matches[0]
            $newFooter = $footer -replace '</footer>', @'
    <div class="footer-links">
      <a href="aviso-legal.html">Aviso Legal</a>
    </div>
  </footer>
'@
            $newContent = $content -replace [regex]::Escape($footer), $newFooter
            
            # Write the updated content back to the file
            Set-Content -Path $file.FullName -Value $newContent
            
            Write-Host "Updated footer in $($file.Name)"
        } else {
            Write-Host "No footer found in $($file.Name)"
        }
    } else {
        Write-Host "Footer already updated in $($file.Name)"
    }
}

Write-Host "All footers have been updated!"
