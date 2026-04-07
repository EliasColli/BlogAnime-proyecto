import os
import re

html_dir = r"c:\Users\anyba\Downloads\BlogAnime-proyecto\html"
files_to_update = [
    "ultimo-bootstrap.html",
    "tendencias-bootstrap.html",
    "temporadas-bootstrap.html",
    "rankings-bootstrap.html",
    "panel_escritor-bootstrap.html",
    "nosotros-bootstrap.html",
    "cultura-bootstrap.html",
    "article-bootstrap.html"
]

# Read the new header from index-bootstrap.html
with open(os.path.join(html_dir, "index-bootstrap.html"), "r", encoding="utf-8") as f:
    index_content = f.read()

# Extract header from index
header_match = re.search(r'<header class="navbar navbar-expand-md navbar-dark sakura-topnav fixed-top">.*?</header>', index_content, re.DOTALL)
new_header = header_match.group(0)

# Replace in targeted files
for file in files_to_update:
    path = os.path.join(html_dir, file)
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace header block
    content = re.sub(r'<header class="navbar navbar-expand-md navbar-dark sakura-topnav fixed-top">.*?</header>', new_header, content, flags=re.DOTALL)
    
    # Remove subnav block entirely
    content = re.sub(r'<div class="ab-subnav d-none d-md-block">\s*<div class="container-xxl.*?</div>\s*</div>', '', content, flags=re.DOTALL)
    
    page_map = {
        "ultimo-bootstrap.html": "ÚLTIMO",
        "tendencias-bootstrap.html": "EN EMISIÓN",
        "temporadas-bootstrap.html": "TEMPORADAS",
        "rankings-bootstrap.html": "RANKINGS",
        "panel_escritor-bootstrap.html": "ESCRIBIR",
        "cultura-bootstrap.html": "CULTURA",
        "article-bootstrap.html": "RESEÑAS"
    }

    if file in page_map:
        active_tab = page_map[file]
        content = re.sub(r'(class="nav-link sakura-link)\s*sakura-underline(")', r'\1\2', content) # Remove it everywhere
        # Add it to the targeted one
        content = re.sub(rf'(<a class="nav-link sakura-link)(" href="[^"]*">{active_tab}</a>)', r'\1 sakura-underline\2', content)
        
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# And now for the CSS modification:
css_path = r"c:\Users\anyba\Downloads\BlogAnime-proyecto\css\style.css"
with open(css_path, "r", encoding="utf-8") as f:
    css_content = f.read()
# Replace filter: grayscale(...)
css_content = re.sub(r'^[ \t]*filter:\s*grayscale\(.*?\)[^;]*;[ \t]*\n?', '', css_content, flags=re.MULTILINE)
with open(css_path, "w", encoding="utf-8") as f:
    f.write(css_content)

print("Done")
