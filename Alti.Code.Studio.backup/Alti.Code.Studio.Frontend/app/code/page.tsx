// "use client";

// import ChatBotLayout from "@/components/ChatbotLayout";
// import React, { useState, useEffect, useRef, useCallback } from "react";

// // --- TYPE DEFINITIONS ---

// // 1. Define custom window type to correctly handle the dynamically loaded 'require' function.
// interface CustomWindow extends Window {
//   require?: {
//     config: (config: any) => void;
//     (deps: string[], callback: (monaco: any) => void): void;
//   };
// }
// declare const window: CustomWindow;

// // Define Log type for the console output
// interface LogEntry {
//   text: string;
//   type: "normal" | "error" | "alert" | "system";
// }

// // Define the single File structure for the sandbox content
// interface SingleFileContent {
//   name: string;
//   language: string;
//   content: string;
// }

// // --- Helper Functions and Initial State ---

// // Initial content for the single index.html file
// const INITIAL_FILE_CONTENT: SingleFileContent = {
//   name: "index.html",
//   language: "html",
//   content: `<!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Live Sandbox</title>
//     <script src="https://cdn.tailwindcss.com"></script>
//     <style>
//         /* CSS content goes here (e.g., from original style.css) */
//         body {
//             font-family: 'Inter', sans-serif;
//         }
        
//         #greeting {
//             animation: pulse-color 2s infinite alternate;
//         }
        
//         @keyframes pulse-color {
//             from { color: #38bdf8; } /* sky-400 */
//             to { color: #7dd3fc; }   /* sky-300 */
//         }
//     </style>
// </head>
// <body class="bg-gray-900 !text-white flex flex-col items-center justify-center min-h-screen p-8">
    
//     <h1 id="greeting" class="text-2xl font-extrabold text-sky-400">
//         Hello World! 👋
//     </h1>

//     <script>
//         console.log('[INDEX.JS] Script file loaded successfully.');
//         console.log('--- Code is not running yet. Click RUN to execute changes! ---');
//     </script>
// </body>
// </html>`,
// };

// // --- Main App Component ---

// const LiveHTMLEditor = () => {
//   // State for Editor and Console
//   const [fileState, setFileState] =
//     useState<SingleFileContent>(INITIAL_FILE_CONTENT);
//   const [isMonacoLoaded, setIsMonacoLoaded] = useState<boolean>(false);
    
//   // It only updates when 'Run' is clicked, not when typing occurs.
//   const [renderedContent, setRenderedContent] = useState<string>(
//     INITIAL_FILE_CONTENT.content
//   );
    
//   // Logs stored as objects
//   const [logs, setLogs] = useState<LogEntry[]>([]);
//   const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(true);

//   // Refs for Monaco and Preview
//   const editorRef = useRef<any>(null);
//   const monacoRef = useRef<any>(null);
//   const editorContainerRef = useRef<HTMLDivElement>(null);
//   const previewIframeRef = useRef<HTMLIFrameElement>(null);

//   // --- Live Preview Functions ---

//   const generatePreviewContent = useCallback((): string => {
//     // This uses the current fileState.content (latest code from editor)
//     const htmlContent = fileState.content;

//     // This wrapper safely redirects console output and errors from the iframe back to the parent component
//     const sandboxJsWrapper = `
//             <script type="text/javascript">
//                 (function() {
//                     const postMessage = (type, logs) => {
//                         if (window.parent) {
//                             window.parent.postMessage({ type, logs: logs.map(arg => String(arg)) }, '*');
//                         }
//                     };
                    
//                     const originalLog = console.log;
//                     console.log = function(...args) {
//                         postMessage('LOG', args);
//                         originalLog.apply(console, args);
//                     };
                    
//                     const originalError = console.error;
//                     console.error = function(...args) {
//                         postMessage('ERROR', args); 
//                         originalError.apply(console, args);
//                     };
                    
//                     window.alert = function(msg) {
//                         postMessage('ALERT', ['ALERT: ' + msg]);
//                         const alertBox = document.createElement('div');
//                         alertBox.className = 'fixed top-4 right-4 bg-yellow-500 text-gray-900 p-3 rounded-xl shadow-2xl z-[1000] transition-opacity duration-300 opacity-100 font-semibold text-sm';
//                         alertBox.textContent = 'Notification: ' + msg;
//                         document.body.appendChild(alertBox);
//                         setTimeout(() => {
//                             alertBox.style.opacity = '0';
//                             setTimeout(() => alertBox.remove(), 300);
//                         }, 3000);
//                     };
//                     window.confirm = () => {
//                         postMessage('ALERT', ['Confirmation prompt blocked.']);
//                         return false;
//                     };

//                     window.onerror = function (message, source, lineno, colno, error) {
//                         console.error('Uncaught Error:', message, 'at line', lineno);
//                         return true;
//                     };
//                 })();
//             </script>
//         `;
//     return htmlContent.replace("</body>", `${sandboxJsWrapper}</body>`);
//   }, [fileState.content]);

//   // Function to refresh the iframe and clear the console - ONLY called by 'Run' button.
//   const updatePreview = useCallback(() => {
//     // 1. Generate the fully wrapped content using the latest code
//     const contentToRender = generatePreviewContent();
    
//     // 2. Set the state that the iframe is bound to
//     setRenderedContent(contentToRender);

//     // 3. Clear console and show system message
//     setLogs([
//       {
//         text: "--- Output Cleared, Rendering HTML/CSS/JS... ---",
//         type: "system",
//       },
//     ]);
//   }, [generatePreviewContent]);

//   // Function to handle content change in Monaco
//   const handleEditorChange = useCallback(
//     (newContent: string) => {
//       // **CRITICAL CHANGE:** ONLY update the code in fileState.
//       // The renderedContent state (and thus the preview) is untouched.
//       setFileState((prevFile) => ({
//         ...prevFile,
//         content: newContent,
//       }));
//     },
//     [] 
//   );

//   // --- Monaco Editor Initialization ---
//   useEffect(() => {
//     // ... (Monaco loading logic remains the same)
//     const script = document.createElement("script");
//     script.src =
//       "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js";
//     script.onload = () => {
//       if (window.require) {
//         window.require.config({
//           paths: {
//             vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs",
//           },
//         });

//         window.require(["vs/editor/editor.main"], (monaco: any) => {
//           monacoRef.current = monaco;
//           setIsMonacoLoaded(true);
//         });
//       }
//     };
//     document.body.appendChild(script);

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);

//   // --- Editor Creation and Content Sync ---
//   useEffect(() => {
//     if (isMonacoLoaded && editorContainerRef.current) {
//       const monaco = monacoRef.current;

//       if (!editorRef.current) {
//         // 1. Initial creation
//         editorRef.current = monaco.editor.create(editorContainerRef.current, {
//           value: fileState.content,
//           language: fileState.language,
//           theme: "vs-dark",
//           automaticLayout: true,
//           minimap: { enabled: false },
//           fontFamily: "Fira Code, Inter, monospace",
//           fontSize: 14,
//           scrollBeyondLastLine: false,
//           padding: { top: 10 },
//         });

//         // 2. Set up content change listener
//         editorRef.current.onDidChangeModelContent(() => {
//           const newContent: string = editorRef.current.getValue();
//           handleEditorChange(newContent);
//         });

//         // 3. NO initial preview run. Preview starts static.
//       } else {
//         const model = editorRef.current.getModel();
//         if (model.getValue() !== fileState.content) {
//           model.setValue(fileState.content);
//         }
//         monaco.editor.setModelLanguage(model, fileState.language);
//       }
//     }
//   }, [
//     isMonacoLoaded,
//     fileState.content,
//     fileState.language,
//     handleEditorChange,
//   ]);

//   // --- Console Logging Listener (updates the Terminal pane) ---
//   useEffect(() => {
//     const handleConsoleMessage = (event: MessageEvent) => {
//       if (
//         event.data &&
//         (event.data.type === "LOG" ||
//           event.data.type === "ERROR" ||
//           event.data.type === "ALERT")
//       ) {
//         setLogs((prevLogs) => {
//           const newLogObjects: LogEntry[] = event.data.logs.map(
//             (log: string) => {
//               let type: LogEntry["type"] = "normal";
//               if (event.data.type === "ERROR") type = "error";
//               if (event.data.type === "ALERT") type = "alert";
//               return { text: log, type };
//             }
//           );
//           const filteredPrevLogs = prevLogs.filter(
//             (log) => log.type !== "system"
//           );
//           const finalLogs = [...filteredPrevLogs, ...newLogObjects].slice(-100); 
//           return finalLogs;
//         });
//       }
//     };
//     window.addEventListener("message", handleConsoleMessage);
//     return () => window.removeEventListener("message", handleConsoleMessage);
//   }, []);

//   // --- UI Loading State ---
//   if (!isMonacoLoaded) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-950 text-white">
//         <div className="text-xl animate-pulse">
//           <svg
//             className="animate-spin -ml-1 mr-3 h-5 w-5 text-sky-400 inline"
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//           >
//             <circle
//               className="opacity-25"
//               cx="12"
//               cy="12"
//               r="10"
//               stroke="currentColor"
//               strokeWidth="4"
//             ></circle>
//             <path
//               className="opacity-75"
//               fill="currentColor"
//               d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//             ></path>
//           </svg>
//           Loading Code Editor...
//         </div>
//       </div>
//     );
//   }

//   // --- UI Layout ---
//   const layoutClasses: string =
//     "flex h-screen w-full bg-gray-950 text-gray-200 overflow-hidden";
//   const mainContentClasses: string = "flex-1 flex flex-col";
//   const splitPaneClasses: string = "flex flex-1 min-h-0";
//   const editorPaneClasses: string =
//     "flex flex-col w-[60%] border-r border-gray-800";
//   const previewPaneClasses: string = "flex flex-col w-[40%] p-0 bg-white";

//   return (
//     <>
//       <ChatBotLayout>
//         <div
//           className={layoutClasses}
//           style={{ fontFamily: "Inter, sans-serif" }}
//         >
//           {/* 1. Editor and Preview Split Pane */}
//           <div className={mainContentClasses}>
//             {/* Tab Bar - Simplified for Single File */}
//             <div className="flex bg-gray-700 border-b border-sky-500 shadow-md">
//               <div className="flex items-center px-5 py-2 text-sm font-medium bg-gray-950 text-white border-b-2 border-sky-500">
//                 <span className="w-4 mr-2 flex justify-center font-bold text-xs text-orange-400">
//                   {"< />"}
//                 </span>
//                 {fileState.name}
//               </div>
//             </div>

//             {/* Main Split Content */}
//             <div className={splitPaneClasses}>
//               {/* Editor Pane (Monaco) */}
//               <div className={editorPaneClasses}>
//                 <div
//                   ref={editorContainerRef}
//                   className="flex-grow h-full min-h-0"
//                   style={{ height: "100%", minHeight: "0" }}
//                 >
//                   {/* Monaco Editor renders inside this div */}
//                 </div>
//               </div>

//               {/* Preview Pane */}
//               <div className={previewPaneClasses}>
//                 <div className="bg-gray-700 text-white p-2 text-sm font-semibold flex justify-between items-center border-b border-gray-600">
//                   Browser Preview
//                   <button
//                     // This button is the ONLY way to update the renderedContent state.
//                     onClick={updatePreview} 
//                     className="ml-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-1 px-3 rounded-md transition duration-150 shadow-md flex items-center active:scale-95"
//                     title="Force Refresh Preview"
//                   >
//                     <svg
//                       className="w-4 h-4"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0l-1.332-1.332m1.666 1.666l-1.332 1.332m-1.332-1.332l1.332-1.332m-1.332-1.332l1.332 1.332m15.356 2A8.001 8.001 0 0119.418 15m0 0l1.332 1.332m-1.666-1.666l1.332-1.332m1.332 1.332l-1.332 1.332m1.332 1.332l-1.332-1.332"
//                       ></path>
//                     </svg>
//                     <span className="ml-1 hidden sm:inline">Run</span>
//                   </button>
//                 </div>
//                 {/* The iframe is now bound to the static renderedContent state */}
//                 <iframe
//                   ref={previewIframeRef}
//                   id="previewIframe"
//                   className="w-full h-full border-0 bg-white flex-1"
//                   title="Live Code Preview"
//                   sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
//                   srcDoc={renderedContent} // *** THE FINAL FIX ***
//                 ></iframe>
//               </div>
//             </div>

//             {/* Terminal / Console Footer (VS Code Style) */}
//             <div
//               className={`bg-gray-900 border-t border-gray-800 transition-all duration-300 ${isConsoleOpen ? "h-48" : "h-8"}`}
//             >
//               <div
//                 className="flex justify-between items-center px-4 h-8 cursor-pointer bg-gray-800 hover:bg-gray-700/50"
//                 onClick={() => setIsConsoleOpen(!isConsoleOpen)}
//                 title={isConsoleOpen ? "Collapse Terminal" : "Expand Terminal"}
//               >
//                 <h3 className="text-sm font-semibold text-gray-300 flex items-center">
//                   <svg
//                     className="w-4 h-4 mr-2 text-green-400"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
//                     ></path>
//                   </svg>
//                   TERMINAL / CONSOLE
//                 </h3>
//                 <div className="flex items-center">
//                   <button
//                     className="text-gray-400 hover:text-white transition"
//                     onClick={(e: React.MouseEvent) => {
//                       e.stopPropagation();
//                       setLogs([
//                         { text: "--- Console Cleared ---", type: "system" },
//                       ]);
//                     }}
//                     title="Clear Console"
//                   >
//                     <svg
//                       className="w-4 h-4"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                       ></path>
//                     </svg>
//                   </button>
//                   <button className="text-gray-400 hover:text-white transition ml-2">
//                     <svg
//                       className="w-4 h-4"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d={isConsoleOpen ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"}
//                       ></path>
//                     </svg>
//                   </button>
//                 </div>
//               </div>

//               <div
//                 className={`p-3 text-xs font-mono overflow-y-auto bg-gray-950 ${isConsoleOpen ? "h-[calc(100%-2rem)]" : "hidden"}`}
//               >
//                 {logs.map((log, index) => {
//                   let colorClass: string = "text-green-300";
//                   let prefix: string = "> ";

//                   if (log.type === "error") {
//                     colorClass = "text-red-400 font-bold";
//                     prefix = "!!! ERROR: ";
//                   } else if (log.type === "alert") {
//                     colorClass = "text-yellow-400";
//                     prefix = "! ALERT: ";
//                   } else if (log.type === "system") {
//                     colorClass = "text-gray-500 italic";
//                     prefix = "";
//                   }

//                   return (
//                     <div
//                       key={index}
//                       className={`whitespace-pre-wrap leading-tight ${colorClass}`}
//                     >
//                       {prefix}
//                       {log.text}
//                     </div>
//                   );
//                 })}
//                 {logs.length === 0 && (
//                   <div className="text-gray-500">
//                     Awaiting console output. Click **Run** to execute code.
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </ChatBotLayout>
//     </>
//   );
// };

// export default LiveHTMLEditor;


import React from "react";
import ChatBotLayout from "@/components/ChatbotLayout";

const LiveHTMLEditor = () => {
  return (
    <ChatBotLayout>
      <iframe
        src="http://localhost:8080/?folder=/user-projects"
        style={{ width: "100%", height: "100vh", border: "none" }}
      />
    </ChatBotLayout>
  );
};

export default LiveHTMLEditor;