import sys, markdown
src = open(sys.argv[1], encoding='utf-8').read().replace('- [ ] ', '- ☐ ')
body = markdown.markdown(src, extensions=['tables', 'fenced_code'])
css = """
body{font-family:Arial,sans-serif;font-size:11pt;color:#1F2630}
h1{color:#F57E24;font-size:22pt} h2{color:#445D7A;font-size:15pt;border-bottom:2px solid #41AACE}
h3{color:#445D7A;font-size:12pt}
table{border-collapse:collapse;width:100%} th{background:#445D7A;color:#FFFFFF;padding:6px;border:1px solid #445D7A;text-align:left}
td{border:1px solid #C9D6E3;padding:6px;vertical-align:top}
blockquote{background:#E4EDF6;padding:8px;border-left:4px solid #41AACE;margin:8px 0}
pre{background:#E4EDF6;padding:10px;font-family:Arial,sans-serif;white-space:pre-wrap}
code{background:#E4EDF6}
"""
html=f'<html><head><meta charset="utf-8"><style>{css}</style></head><body>{body}</body></html>'
html=html.replace('<hr />','')
html=''.join(c if ord(c)<0x10000 else f'&#{ord(c)};' for c in html)  # xmlcharref: Drive rompe los emojis de 4 bytes
open(sys.argv[2], 'w', encoding='utf-8').write(html)
print('ok')
