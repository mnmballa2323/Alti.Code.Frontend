import sys

with open("components/sidebar.tsx", "r") as f:
    content = f.read()

content = content.replace('    router.prefetch("/slides");\n', "")

with open("components/sidebar.tsx", "w") as f:
    f.write(content)
print("Success")
