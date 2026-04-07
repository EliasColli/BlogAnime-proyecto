$nav = Get-Content '.\html\index-bootstrap.html' -Raw
$header = [regex]::Match($nav, '(?s)<header class="navbar navbar-expand-md navbar-dark sakura-topnav fixed-top">.*?</header>').Value

$files = 'ultimo-bootstrap.html','tendencias-bootstrap.html','temporadas-bootstrap.html','rankings-bootstrap.html','panel_escritor-bootstrap.html','cultura-bootstrap.html','article-bootstrap.html','nosotros-bootstrap.html'

foreach ($f in $files) {
    if ((Test-Path ".\html\$f") -eq $false) { continue }
    $path = ".\html\$f"
    $content = Get-Content $path -Raw
    
    $content = [regex]::Replace($content, '(?s)<header class="navbar navbar-expand-md navbar-dark sakura-topnav fixed-top">.*?</header>', $header)
    $content = [regex]::Replace($content, '(?s)<div class="ab-subnav d-none d-md-block">\s*<div class="container-xxl.*?</div>\s*</div>', '')
    
    $tab = ''
    switch($f) {
        'ultimo-bootstrap.html' {$tab = 'ÚLTIMO'}
        'tendencias-bootstrap.html' {$tab = 'EN EMISIÓN'}
        'temporadas-bootstrap.html' {$tab = 'TEMPORADAS'}
        'rankings-bootstrap.html' {$tab = 'RANKINGS'}
        'panel_escritor-bootstrap.html' {$tab = 'ESCRIBIR'}
        'cultura-bootstrap.html' {$tab = 'CULTURA'}
        'article-bootstrap.html' {$tab = 'RESEÑAS'}
    }
    
    if ($tab) {
        $content = [regex]::Replace($content, 'class="nav-link sakura-link sakura-underline"', 'class="nav-link sakura-link"')
        $content = [regex]::Replace($content, '(class="nav-link sakura-link)(" href="[^"]*">' + $tab + '</a>)', '$1 sakura-underline$2')
    }

    Set-Content $path -Value $content -Encoding UTF8
}

$css = Get-Content '.\css\style.css' -Raw
$css = [regex]::Replace($css, '(?m)^[ \t]*filter:\s*grayscale\(.*?\)[^;]*;[ \t]*\r?\n?', '')
Set-Content '.\css\style.css' -Value $css -Encoding UTF8
