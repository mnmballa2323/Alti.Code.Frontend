import re

with open('app/functions/page.tsx', 'r') as f:
    content = f.read()

# 1. Add Import
if 'PromptInputFullLineWithBottomActions' not in content:
    content = content.replace(
        'import ChatBotLayout',
        'import PromptInputFullLineWithBottomActions from "@/components/input-actions";\nimport ChatBotLayout'
    )

# 2. Add state variables inside FunctionsPageContent
state_vars = """
  const [promptValue, setPromptValue] = useState("");
  const [activeTab, setActiveTab] = useState<"code" | "console">("code");
  const [isDraft, setIsDraft] = useState(false);
"""
if 'const [promptValue' not in content:
    content = content.replace(
        'const [execResult, setExecResult] = useState<ExecutionResult | null>(null);',
        'const [execResult, setExecResult] = useState<ExecutionResult | null>(null);\n' + state_vars
    )

# 3. Update selectFunc
if 'setIsDraft(false)' not in content:
    content = content.replace(
        'setExecResult(null);\n  };',
        'setExecResult(null);\n    setIsDraft(false);\n    setActiveTab("code");\n  };'
    )

# 4. Update handleNew
if 'setIsDraft(false)' not in content:
    content = content.replace(
        'setExecResult(null);\n  };\n\n  const applyTemplate',
        'setExecResult(null);\n    setIsDraft(false);\n  };\n\n  const applyTemplate'
    )

# 5. Update handleExecute to switch to console tab
if 'setIsExecuting(true);' in content and 'setActiveTab("console");' not in content:
    content = content.replace(
        'setIsExecuting(true);',
        'setIsExecuting(true);\n    setActiveTab("console");'
    )

# 6. Replace the entire return statement
return_start = content.find('  return (\n    <ChatBotLayout>')
return_replacement = """  return (
    <ChatBotLayout>
      <div className="flex flex-1 h-full font-sans bg-[#F4F4F6] dark:bg-background overflow-hidden">
        <div className="flex-1 flex flex-col h-full min-w-0 relative">
          {!selectedFunc && !isDraft ? (
            <div className="flex h-full w-full items-center justify-center pb-[10vh] bg-[#F4F4F6] dark:bg-background">
              <div className="flex w-full flex-col items-center gap-6 z-20 px-6 max-w-2xl">
                <div className="flex flex-col items-center text-center z-30 mb-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80 font-sans">
                    Create a New Function
                  </h1>
                  <p className="text-default-400 mt-2 text-sm">
                    Describe what you want this serverless function to do.
                  </p>
                </div>
                <PromptInputFullLineWithBottomActions
                  hideAgents={true}
                  hideDropdown={true}
                  placeholder="e.g. Format Stripe webhooks and extract the customer email..."
                  prompt={promptValue}
                  setPrompt={setPromptValue}
                  onSend={(prompt) => {
                    setPromptValue("");
                    setDescription(prompt);
                    setName("New Function");
                    setCode(DEFAULT_CODE);
                    setIsDraft(true);
                    setActiveTab("code");
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Action Bar */}
              <div className="h-[56px] px-6 bg-white dark:bg-[#161b22]/40 border-b border-default-200/50 dark:border-gray-800 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <select
                    className="bg-transparent font-semibold text-sm text-foreground outline-none cursor-pointer border border-default-200/50 dark:border-gray-800 rounded-lg px-2 py-1 appearance-none hover:bg-default-100 dark:hover:bg-default-800/50 transition-colors"
                    value={selectedFunc ? selectedFunc.id : "new"}
                    onChange={(e) => {
                      if (e.target.value === "new") handleNew();
                      else {
                        const func = functions.find(f => f.id === e.target.value);
                        if (func) selectFunc(func);
                      }
                    }}
                  >
                    <option value="new" className="bg-white dark:bg-[#161b22]">+ New Function</option>
                    {functions.map(f => (
                      <option key={f.id} value={f.id} className="bg-white dark:bg-[#161b22]">{f.name}</option>
                    ))}
                  </select>
                  <span className="text-default-200 dark:text-gray-800 shrink-0 select-none">
                    |
                  </span>
                  <input
                    className="bg-transparent border-none outline-none font-semibold text-sm text-foreground placeholder-gray-400 w-52 shrink-0 focus:ring-0"
                    placeholder="Function Name..."
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <span className="text-default-200 dark:text-gray-800 shrink-0 select-none">
                    |
                  </span>
                  <input
                    className="bg-transparent border-none outline-none text-xs text-default-400 placeholder-gray-400 flex-1 min-w-0 focus:ring-0"
                    placeholder="Add optional description..."
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative group mr-2">
                    <Button className="bg-default-100 dark:bg-default-800 text-foreground rounded-xl text-xs px-3.5">
                      <BookOpen className="w-3.5 h-3.5 mr-1" /> Presets
                    </Button>
                    <div className="absolute right-0 top-9 z-50 w-64 bg-white dark:bg-[#161b22] border border-default-200/50 dark:border-gray-800 rounded-xl shadow-xl hidden group-hover:block hover:block py-1.5 animate-in fade-in duration-200">
                      {TEMPLATES.map((tmpl, idx) => (
                        <button
                          key={idx}
                          className="w-full px-4 py-2.5 hover:bg-default-50 dark:hover:bg-default-50/10 text-left flex flex-col gap-0.5 border-b last:border-0 border-default-100 dark:border-gray-800/50"
                          onClick={() => applyTemplate(tmpl.code)}
                        >
                          <span className="text-xs font-semibold text-foreground">
                            {tmpl.name}
                          </span>
                          <span className="text-[10px] text-default-400 leading-normal">
                            {tmpl.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedFunc && (
                    <Button
                      className="rounded-xl px-3.5 text-xs min-w-0"
                      color="danger"
                      variant="light"
                      onClick={handleDelete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    className="bg-default-100 dark:bg-default-800 text-foreground rounded-xl text-xs px-4 font-medium"
                    isLoading={isSaving}
                    onClick={handleSave}
                  >
                    <Save className="w-3.5 h-3.5 mr-1" /> Save
                  </Button>
                  <Button
                    className="bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs px-4 font-semibold shadow-md"
                    isLoading={isExecuting}
                    onClick={handleExecute}
                  >
                    <Play className="w-3.5 h-3.5 mr-1" /> Run Code
                  </Button>
                </div>
              </div>

              {/* Tab Bar */}
              <div className="flex items-center gap-4 px-6 border-b border-default-200/50 dark:border-gray-800 bg-white/50 dark:bg-[#161b22]/20 h-[40px] shrink-0">
                <button
                  onClick={() => setActiveTab("code")}
                  className={`text-[11px] font-semibold h-full border-b-[3px] px-2 transition-colors flex items-center ${activeTab === "code" ? "border-primary text-primary" : "border-transparent text-default-400 hover:text-foreground"}`}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Code Editor
                </button>
                <button
                  onClick={() => setActiveTab("console")}
                  className={`text-[11px] font-semibold h-full border-b-[3px] px-2 transition-colors flex items-center ${activeTab === "console" ? "border-primary text-primary" : "border-transparent text-default-400 hover:text-foreground"}`}
                >
                  <Terminal className="w-3.5 h-3.5 mr-1.5" /> Console Output
                  {isExecuting && <Loader2 className="w-3 h-3 ml-1.5 inline animate-spin text-primary" />}
                </button>
              </div>

              {/* Code Editor and Console Container */}
              <div className="flex-1 flex flex-col min-h-0 bg-[#FAFAFA] dark:bg-background overflow-hidden relative">
                {activeTab === "code" ? (
                  <div className="flex-1 flex flex-col min-h-0 p-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-end mb-2">
                      <span className="text-[10px] text-default-400 font-mono bg-default-100 dark:bg-default-800/50 px-2 py-0.5 rounded-lg">
                        javascript (vm-isolated)
                      </span>
                    </div>

                    <div className="flex-1 flex bg-white dark:bg-[#0d1117] border border-default-200/50 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm relative">
                      <div className="w-12 bg-gray-50/50 dark:bg-gray-800/10 border-r border-default-100 dark:border-gray-800/50 py-4 font-mono text-[10px] text-default-300 text-right pr-3 select-none overflow-hidden h-full">
                        {lineNumbers.map((n) => (
                          <div key={n} className="leading-normal h-[18px]">
                            {n}
                          </div>
                        ))}
                      </div>

                      <textarea
                        className="flex-1 p-4 pl-2 bg-transparent border-none text-[12px] font-mono outline-none resize-none overflow-y-auto leading-normal tracking-wide text-gray-800 dark:text-gray-200 selection:bg-primary/20"
                        spellCheck={false}
                        style={{ lineHeight: "18px" }}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col min-h-0 p-4 bg-[#F4F4F6] dark:bg-[#161b22]/10 animate-in fade-in duration-200">
                    <div className="flex-1 bg-white dark:bg-[#0d1117] border border-default-200/50 dark:border-gray-800 rounded-2xl p-4 overflow-y-auto font-mono text-[11px] flex flex-col gap-3 shadow-sm">
                      {isExecuting ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-default-400 gap-3">
                          <Loader2 className="w-6 h-6 text-primary animate-spin" />
                          <span className="text-[11px]">
                            Executing script in E2B VM sandbox...
                          </span>
                        </div>
                      ) : execResult ? (
                        <div className="flex flex-col gap-4">
                          <div className="grid grid-cols-2 gap-2 border-b border-default-100 dark:border-gray-800/80 pb-3">
                            <div className="bg-default-50 dark:bg-default-800/20 p-2 rounded-xl flex items-center gap-2">
                              <Cpu className="w-4 h-4 text-primary" />
                              <div className="flex flex-col">
                                <span className="text-[9px] text-default-400 uppercase">
                                  STATUS
                                </span>
                                <span
                                  className={`text-[11px] font-bold ${execResult.success ? "text-emerald-500" : "text-rose-500"}`}
                                >
                                  {execResult.success ? "SUCCESS" : "FAILED"}
                                </span>
                              </div>
                            </div>
                            <div className="bg-default-50 dark:bg-default-800/20 p-2 rounded-xl flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              <div className="flex flex-col">
                                <span className="text-[9px] text-default-400 uppercase">
                                  DURATION
                                </span>
                                <span className="text-[11px] font-bold text-foreground">
                                  {execResult.duration} ms
                                </span>
                              </div>
                            </div>
                          </div>

                          {execResult.logs.length > 0 && (
                            <div className="flex flex-col gap-2">
                              <span className="text-[10px] uppercase text-default-400 font-bold tracking-wider">
                                Console Logs (stdout)
                              </span>
                              <div className="flex flex-col gap-1.5 text-gray-700 dark:text-gray-300 pl-3 border-l-2 border-primary/20 bg-gray-50/50 dark:bg-gray-800/10 p-2.5 rounded-lg">
                                {execResult.logs.map((log, index) => (
                                  <div
                                    key={index}
                                    className="whitespace-pre-wrap leading-relaxed"
                                  >
                                    {log}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {execResult.success ? (
                            <div className="flex flex-col gap-2">
                              <span className="text-[10px] uppercase text-default-400 font-bold tracking-wider">
                                Return Value
                              </span>
                              <pre className="bg-emerald-50/20 dark:bg-emerald-500/5 p-3 rounded-xl overflow-x-auto text-emerald-500 font-semibold border border-emerald-500/15 whitespace-pre-wrap leading-relaxed shadow-sm">
                                {execResult.result}
                              </pre>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2 text-rose-500">
                              <span className="text-[10px] uppercase text-rose-500 font-bold tracking-wider flex items-center gap-1.5">
                                <ShieldAlert className="w-4 h-4 shrink-0" /> Exception
                                Trace
                              </span>
                              <pre className="bg-rose-500/10 p-3 rounded-xl overflow-x-auto font-bold border border-rose-500/15 whitespace-pre-wrap leading-relaxed">
                                {execResult.error}
                              </pre>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-default-400 text-center px-4 gap-2">
                          <Terminal className="w-6 h-6 text-default-300" />
                          <span className="text-[11px] leading-normal">
                            Execution output will appear here.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ChatBotLayout>
  );"""
if return_start != -1:
    old_return = content[return_start:content.rfind('}') - 2]
    content = content.replace(content[return_start:], return_replacement + '\n}\n\nexport default function FunctionsPage() {\n  return (\n    <Suspense\n      fallback={<div className="h-full w-full bg-[#F4F4F6] dark:bg-background" />}\n    >\n      <FunctionsPageContent />\n    </Suspense>\n  );\n}\n')

with open('app/functions/page.tsx', 'w') as f:
    f.write(content)
