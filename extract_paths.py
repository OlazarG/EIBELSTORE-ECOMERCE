import re

with open(r'c:\Users\Computer\Documents\ECOMERCE\image\diamante.svg', 'r') as f:
    svg_content = f.read()

# Extract paths that are not background
paths = re.findall(r'<path[^>]+>', svg_content)
inner_paths = []
for p in paths:
    if 'fill="#030404"' in p or 'fill="#FEFDFD"' in p:
        continue
    # Clean up paths for stroke animation
    p = re.sub(r'fill="[^"]+"', 'fill="none"', p)
    p = re.sub(r'stroke="[^"]+"', '', p)
    p = re.sub(r'style="[^"]+"', '', p)
    inner_paths.append(p)

diamond_html = f'''
<svg class="diamond-svg w-full max-w-[900px] h-auto opacity-10" viewBox="0 0 2816 1536" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g class="diamond-facets" stroke="#d4af37" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        {"".join(inner_paths)}
    </g>
</svg>
'''

with open(r'c:\Users\Computer\Documents\ECOMERCE\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the content inside hero-bg-shapes
pattern = r'(<div class="hero-bg-shapes[^>]*>).*?(<\/div>)'
new_html = re.sub(pattern, rf'\1{diamond_html}\2', html, flags=re.DOTALL)

with open(r'c:\Users\Computer\Documents\ECOMERCE\index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Successfully injected diamond SVG facets into index.html")
