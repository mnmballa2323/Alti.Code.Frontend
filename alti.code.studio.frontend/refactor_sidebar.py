import sys

def modify_sidebar():
    with open("components/sidebar.tsx", "r") as f:
        content = f.read()

    # 1. Add Tuning and Connectors to navigationItems
    tuning_connector_items = """    {
      label: "Tuning",
      icon: SlidersHorizontal,
      path: "/instructions",
      isActive: pathname === "/instructions" || pathname === "/guardrails" || pathname === "/knowledge",
      onClick: () => {
        router.push("/instructions");
      },
    },
    {
      label: "Connectors",
      icon: Cable,
      path: "/connect-apps",
      isActive: pathname === "/connect-apps" || pathname?.startsWith("/database") || pathname === "/cloud",
      onClick: () => {
        router.push("/connect-apps");
      },
    },
  ];"""

    content = content.replace("  ];\n\n  const policyNavigationItems", tuning_connector_items + "\n\n  const policyNavigationItems")

    # 2. Remove policyNavigationItems and connectorNavigationItems
    import re
    
    # Remove policyNavigationItems
    policy_pattern = r'  const policyNavigationItems = \[.*?\];\n\n'
    content = re.sub(policy_pattern, '', content, flags=re.DOTALL)
    
    # Remove connectorNavigationItems
    connector_pattern = r'  const connectorNavigationItems = \[.*?\];\n\n'
    content = re.sub(connector_pattern, '', content, flags=re.DOTALL)

    # 3. Remove filteredPolicyItems and filteredConnectorItems
    filtered_policy_pattern = r'  const filteredPolicyItems = policyNavigationItems\.filter.*?;\n\n'
    content = re.sub(filtered_policy_pattern, '', content, flags=re.DOTALL)
    
    filtered_connector_pattern = r'  const filteredConnectorItems = connectorNavigationItems\.filter.*?;\n\n'
    content = re.sub(filtered_connector_pattern, '', content, flags=re.DOTALL)

    # 4. Remove the second toggle grid
    second_grid_pattern = r'        \{\/\* Project Parameters.*?<\/div>\n        <\/div>\n\n'
    content = re.sub(second_grid_pattern, '', content, flags=re.DOTALL)

    # 5. Make sure SlidersHorizontal and Cable are imported from lucide-react
    if "SlidersHorizontal" not in content or "Cable" not in content:
        # Find the lucide-react import and add them
        lucide_import_pattern = r'(import\s+\{.*?)(\}\s+from\s+"lucide-react";)'
        
        def add_icons(match):
            imports = match.group(1)
            if "SlidersHorizontal" not in imports:
                imports += ", SlidersHorizontal"
            if "Cable" not in imports:
                imports += ", Cable"
            return imports + match.group(2)
            
        content = re.sub(lucide_import_pattern, add_icons, content, flags=re.DOTALL)

    with open("components/sidebar.tsx", "w") as f:
        f.write(content)

    print("Success")

if __name__ == "__main__":
    modify_sidebar()
