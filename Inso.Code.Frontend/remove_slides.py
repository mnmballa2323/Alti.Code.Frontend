import sys

target_code = """    {
      label: "Slides",
      icon: Presentation,
      path: "/slides",
      isActive: pathname === "/slides",
      onClick: () => {
        router.push("/slides");
      },
    },
"""

with open("components/sidebar.tsx", "r") as f:
    content = f.read()

if target_code in content:
    content = content.replace(target_code, "")
    with open("components/sidebar.tsx", "w") as f:
        f.write(content)
    print("Success")
else:
    print("Target code not found")
