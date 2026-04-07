import glob
import re

files = glob.glob('html/*.html')

new_ul = '''<ul class="navbar-nav me-auto ms-md-4 align-items-md-center gap-3 gap-lg-4" style="font-size: 0.9rem;">
                <li class="nav-item"><a class="nav-link sakura-link{mag_active}" href="index-bootstrap.html">MAGAZINE</a></li>
                <li class="nav-item"><a class="nav-link sakura-link{tend_active}" href="tendencias-bootstrap.html">EN EMISIÓN</a></li>
                <li class="nav-item"><a class="nav-link sakura-link{res_active}" href="article-bootstrap.html">RESEÑAS</a></li>
                <li class="nav-item"><a class="nav-link sakura-link{rank_active}" href="rankings-bootstrap.html">RANKINGS</a></li>
                <li class="nav-item"><a class="nav-link sakura-link{ult_active}" href="ultimo-bootstrap.html">ÚLTIMO</a></li>
                <li class="nav-item"><a class="nav-link sakura-link{cult_active}" href="cultura-bootstrap.html">CULTURA</a></li>
                <li class="nav-item"><a class="nav-link sakura-link{temp_active}" href="temporadas-bootstrap.html">TEMPORADAS</a></li>
                <li class="nav-item"><a class="nav-link sakura-link{nos_active}" href="nosotros-bootstrap.html">NOSOTROS</a></li>
            </ul>'''

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # skip if no navbar
    if '<ul class="navbar-nav' not in content:
        continue
        
    filename = fpath.replace('html\\', '').replace('html/', '')
    mag_active = ' sakura-underline' if filename == 'index-bootstrap.html' else ''
    tend_active = ' sakura-underline' if filename == 'tendencias-bootstrap.html' else ''
    res_active = ' sakura-underline' if filename == 'article-bootstrap.html' else ''
    rank_active = ' sakura-underline' if filename == 'rankings-bootstrap.html' else ''
    ult_active = ' sakura-underline' if filename == 'ultimo-bootstrap.html' else ''
    cult_active = ' sakura-underline' if filename == 'cultura-bootstrap.html' else ''
    temp_active = ' sakura-underline' if filename == 'temporadas-bootstrap.html' else ''
    nos_active = ' sakura-underline' if filename == 'nosotros-bootstrap.html' else ''
    
    current_ul = new_ul.format(
        mag_active=mag_active,
        tend_active=tend_active,
        res_active=res_active,
        rank_active=rank_active,
        ult_active=ult_active,
        cult_active=cult_active,
        temp_active=temp_active,
        nos_active=nos_active
    )
    
    new_content = re.sub(
        r'<ul class="navbar-nav[^>]*>.*?</ul>',
        current_ul,
        content,
        flags=re.DOTALL
    )
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
print("OK")
