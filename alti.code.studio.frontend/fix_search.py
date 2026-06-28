import sys

target_code = """          <div
            className={cn(
              "bg-white/5 border border-white/5 rounded-xl p-1 flex flex-row items-center justify-between gap-1 w-full"
            )}
          >
            {/* Search Input */}
            <div className="relative flex-1 h-[32px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-default-400 z-10" />
              <input
                className="w-full h-full bg-transparent hover:bg-white/5 border-none rounded-lg pl-8 pr-2 py-0 text-xs focus:outline-none focus:ring-0 transition-all text-default-300 placeholder:text-default-500"
                placeholder="Search..."
                value={leftSidebarSearch}
                onChange={(e) => setLeftSidebarSearch(e.target.value)}
              />
            </div>

            {/* Plus Button */}
            <Tooltip"""

replacement_code = """          <div
            className={cn(
              "bg-white/5 border border-white/5 rounded-xl p-1 flex flex-row items-center justify-between gap-1 w-full"
            )}
          >
            {/* Search Input */}
            <div className="relative flex-1 h-[32px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-default-400 z-10" />
              <input
                className="w-full h-full bg-transparent hover:bg-white/5 border-none rounded-lg pl-8 pr-2 py-0 text-xs focus:outline-none focus:ring-0 transition-all text-default-300 placeholder:text-default-500"
                placeholder="Search..."
                value={leftSidebarSearch}
                onChange={(e) => setLeftSidebarSearch(e.target.value)}
              />
            </div>

            {/* Divider */}
            <div className="w-[1px] h-4 bg-white/10 shrink-0 mx-0.5" />

            {/* Plus Button */}
            <Tooltip"""

with open("components/sidebar.tsx", "r") as f:
    content = f.read()

if target_code in content:
    content = content.replace(target_code, replacement_code)
    with open("components/sidebar.tsx", "w") as f:
        f.write(content)
    print("Success")
else:
    print("Target code not found")
