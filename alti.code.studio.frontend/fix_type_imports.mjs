import fs from 'fs';
import path from 'path';

const files = [
  "app/admin/layout.tsx",
  "app/chat/[id]/ClientPage.tsx",
  "app/new-chat/page.tsx",
  "app/owner/layout.tsx",
  "components/ChatbotLayout.tsx",
  "components/ShadowToggle.tsx",
  "components/WorkspaceDock.tsx",
  "components/ghost-editor.tsx",
  "components/input-actions.tsx",
  "components/message-container.tsx",
  "components/modals/SettingsModal.tsx",
  "components/sidebar.tsx",
  "store/messagesSlice.ts"
];

for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace standalone `import { RootState }` with `import type { RootState }`
    content = content.replace(/import\s*\{\s*RootState\s*\}\s*from\s*"@\/store";/g, 'import type { RootState } from "@/store";');
    content = content.replace(/import\s*\{\s*RootState\s*\}\s*from\s*"\.\/index";/g, 'import type { RootState } from "./index";');
    
    // Replace mixed `import { AppDispatch, RootState }`
    content = content.replace(/import\s*\{\s*AppDispatch,\s*RootState\s*\}\s*from\s*"@\/store";/g, 'import type { AppDispatch, RootState } from "@/store";');
    
    // Replace mixed `import { useAppSelector, useAppDispatch, RootState }`
    content = content.replace(/import\s*\{\s*useAppSelector,\s*useAppDispatch,\s*RootState\s*\}\s*from\s*"@\/store";/g, 'import { useAppSelector, useAppDispatch } from "@/store";\nimport type { RootState } from "@/store";');

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
