
import { projectTool } from './src/app/modules/mcp/tools/project.tool.js';

async function checkManager() {
    console.log('👔 Starting Manager Verification...');

    try {
        // 1. Add Task
        console.log('➕ Adding Task...');
        const addResult = await projectTool.handler({ action: 'add', payload: 'Verify Project Agent' });
        console.log(addResult.content[0].text);

        // Extract ID (hacky regex)
        const idMatch = addResult.content[0].text.match(/ID: (\d+)/);
        if (!idMatch) throw new Error("Could not parse ID");
        const taskId = idMatch[1];

        // 2. List
        console.log('📋 Listing Tasks (Pending)...');
        const list1 = await projectTool.handler({ action: 'list' });
        console.log(list1.content[0].text);
        if (!list1.content[0].text.includes('[ ] Verify Project Agent')) throw new Error("Task not in list");

        // 3. Complete
        console.log('✅ Completing Task...');
        await projectTool.handler({ action: 'complete', payload: taskId });

        // 4. List Again
        console.log('📋 Listing Tasks (Completed)...');
        const list2 = await projectTool.handler({ action: 'list' });
        console.log(list2.content[0].text);
        if (!list2.content[0].text.includes('[x] Verify Project Agent')) throw new Error("Task not marked complete");

        console.log('✅ Manager Verification Successful');

    } catch (error) {
        console.error('❌ Manager Failed:', error);
        process.exit(1);
    }
}

checkManager();
