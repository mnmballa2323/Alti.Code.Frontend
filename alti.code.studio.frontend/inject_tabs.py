import sys
import re

def inject_tabs(file_path, tab_import, tab_component):
    with open(file_path, "r") as f:
        content = f.read()

    # If already injected, skip
    if tab_import in content:
        print(f"Already injected in {file_path}")
        return

    # Find the top of the file to add the import
    import_index = content.find('import ')
    if import_index != -1:
        content = content[:import_index] + tab_import + "\n" + content[import_index:]

    # Now inject the component right after the main header or inside the main wrapper
    # In these pages, there's usually a ChatBotLayout with a flex-1 container
    
    # We'll look for `<div className="w-full max-w-4xl space-y-6">` or similar inner containers
    # Wait, instructions has: `<div className="w-full max-w-4xl space-y-6">`
    # Let's just find `max-w-4xl space-y-6` and insert it inside.
    
    match = re.search(r'(<div[^>]*max-w-4xl[^>]*>)\n', content)
    if match:
        insert_pos = match.end()
        # insert tab component with some margin
        content = content[:insert_pos] + f"            <{tab_component} />\n" + content[insert_pos:]
    else:
        # fallback: find `<ChatBotLayout>` and the first inner div
        # or just find `max-w-7xl` or whatever container they use
        match = re.search(r'(<div[^>]*max-w-(?:4xl|5xl|6xl|7xl)[^>]*>)\n', content)
        if match:
            insert_pos = match.end()
            content = content[:insert_pos] + f"            <{tab_component} />\n" + content[insert_pos:]
        else:
            print(f"Could not find injection point in {file_path}")
            return

    with open(file_path, "w") as f:
        f.write(content)
    print(f"Successfully injected in {file_path}")

tuning_import = 'import { TuningTabs } from "@/components/tuning-tabs";'
connector_import = 'import { ConnectorTabs } from "@/components/connector-tabs";'

inject_tabs("app/instructions/page.tsx", tuning_import, "TuningTabs")
inject_tabs("app/guardrails/page.tsx", tuning_import, "TuningTabs")
inject_tabs("app/knowledge/page.tsx", tuning_import, "TuningTabs")

inject_tabs("app/connect-apps/page.tsx", connector_import, "ConnectorTabs")
inject_tabs("app/database/page.tsx", connector_import, "ConnectorTabs")
inject_tabs("app/cloud/page.tsx", connector_import, "ConnectorTabs")
