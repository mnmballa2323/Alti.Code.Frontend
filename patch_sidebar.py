import re

with open('/Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.frontend/components/sidebar.tsx', 'r') as f:
    text = f.read()

# Extract the Dropdown section
dropdown_match = re.search(r'(<Dropdown\s+className="w-\[240px\].*?</Dropdown>)', text, re.DOTALL)
dropdown_code = dropdown_match.group(1) if dropdown_match else "/* ERROR DROPDOWN */"

# Extract the Primary Nav Buttons
# They start after `<div className="pt-2">` and end before `<Spacer y={4} />` or the old history header.
nav_start_idx = text.find('<div className="pt-2">')
if nav_start_idx != -1:
    nav_end_idx = text.find('</div>\n\n      <Spacer y={4} />', nav_start_idx)
    nav_buttons_code = text[nav_start_idx + len('<div className="pt-2">'):nav_end_idx].strip()
else:
    nav_buttons_code = "/* ERROR NAV BUTTONS */"

# Extract the Login/Register/MyAccount section
login_start_idx = text.find('<div className="mt-auto px-5 pb-5">')
if login_start_idx != -1:
    login_end_idx = text.find('</div>\n    </div>\n  );\n\n  return (')
    login_buttons_code = text[login_start_idx + len('<div className="mt-auto px-5 pb-5">'):login_end_idx].strip()
    login_buttons_code = login_buttons_code.rsplit('</div>', 1)[0].strip() # remove the last closing div of the wrapper
else:
    login_buttons_code = "/* ERROR LOGIN BUTTONS */"

# Extract the History Switch block
history_match = re.search(r'(<ScrollShadow\s+className=[^>]+>.*?)</ScrollShadow>', text, re.DOTALL)
if history_match:
    history_inner_code = history_match.group(1).split('>', 1)[1].strip()
else:
    history_inner_code = "/* ERROR HISTORY */"

new_content = f"""  const content = (
    <div className="flex h-full z-20 bg-white dark:bg-[#0A0A0A]">
      {{/* Primary Column (Left Side Menu) */}}
      <div
        className={{cn(
          "flex h-full flex-col transition-all duration-300 border-r border-default-200",
          isSidebarOpen ? "w-64" : "w-10",
        )}}
      >
        <div className={{cn("pb-3 flex items-center border-b border-default-200", isSidebarOpen ? "px-3 justify-between gap-1" : "px-0 justify-center pt-2")}}>
          <div className={{cn("flex-1 min-w-0", !isSidebarOpen && "hidden")}}>
            {dropdown_code}
          </div>
          {{!isSidebarOpen && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onClick={{toggleLeftSidebar}}
            >
              <PanelLeftOpen className="size-4" />
            </Button>
          )}}
        </div>

        <div className="pt-2 flex-1 overflow-y-auto overflow-x-hidden">
{nav_buttons_code}
        </div>

        <div className={{cn("mt-auto", isSidebarOpen ? "px-5 pb-5 pt-4" : "px-1 pb-4 pt-4")}}>
{login_buttons_code}
        </div>
      </div>

      {{/* Secondary Column (Right Side Menu for History) */}}
      <div
        className={{cn(
          "flex h-full flex-col transition-all duration-300 bg-default-50/50 dark:bg-black/20",
          isSidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden border-none",
        )}}
      >
        <div className="pt-2 pb-3 px-4 flex items-center justify-between border-b border-default-200 min-w-[256px]">
          <span className="text-[12px] font-bold text-default-900 tracking-wider">
            {{getHistoryTitle()}}
          </span>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onClick={{toggleLeftSidebar}}
            className="-mr-2 text-default-400 hover:text-default-600"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        </div>

        {{/* Search bar and + icon on the same line below the line */}}
        <div className="px-3 py-3 flex items-center gap-2 min-w-[256px]">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-default-400" />
            <input
              placeholder="Search..."
              className="w-full bg-white dark:bg-default-50 border border-default-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary transition-all shadow-sm"
            />
          </div>
          {{pathname !== "/instructions" && pathname !== "/guardrails" && pathname !== "/documents" && (
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              className="bg-white dark:bg-default-50 border border-default-200 shadow-sm text-default-600 flex-shrink-0"
              onClick={{() => {{
                if (pathname === "/workflows") {{
                  window.dispatchEvent(new CustomEvent('open-workflow-modal'));
                }} else if (pathname === "/vault") {{
                  window.dispatchEvent(new CustomEvent('open-vault-modal'));
                }} else {{
                  dispatch(startNewChat());
                  router.push("/");
                }}
              }}}}
              title="New"
            >
              <Plus className="size-3.5" />
            </Button>
          )}}
        </div>

        <ScrollShadow className="flex-1 px-2 mt-1 min-w-[256px]">
{history_inner_code}
        </ScrollShadow>
      </div>
    </div>
  );"""

# Replace the whole content block
start_marker = "  const content = ("
end_marker = "  return (\n    <div className=\"flex sticky h-full\">"

start_idx = text.find(start_marker)
end_idx = text.find(end_marker)

if start_idx != -1 and end_idx != -1:
    final_text = text[:start_idx] + new_content + "\n\n" + text[end_idx:]
    with open('/Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.frontend/components/sidebar.tsx', 'w') as f:
        f.write(final_text)
    print("Successfully patched sidebar.tsx")
else:
    print("Could not find markers!")

