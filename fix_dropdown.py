import re

with open("Inso.Code.Frontend/components/input-actions.tsx", "r") as f:
    content = f.read()

lines = content.split('\n')
for i, line in enumerate(lines):
    if "{(mockCloudProvider" in line and "&& (" in line:
        lines[i] = line.replace("&& (", "? (")
        indent = len(line) - len(line.lstrip())
        for j in range(i+1, len(lines)):
            if lines[j].startswith(" " * indent + ")}"):
                lines[j] = lines[j].replace(")}", ") : null as any}")
                break

with open("Inso.Code.Frontend/components/input-actions.tsx", "w") as f:
    f.write("\n".join(lines))
