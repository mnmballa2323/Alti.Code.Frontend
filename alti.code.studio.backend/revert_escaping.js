import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const agentsDir = path.join(__dirname, 'src', 'app', 'modules', 'agents');

function revertOverEscaping(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            revertOverEscaping(fullPath);
        } else if (file.endsWith('.agent.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // We specifically revert \${this.preamble} back to ${this.preamble} 
            // and \${extraContext ? back to ${extraContext ?
            // The previous script accidentally escaped EVERYTHING

            const toRevert = [
                { bad: '\\${this.preamble}', good: '${this.preamble}' },
                { bad: '\\${targetFramework}', good: '${targetFramework}' },
                { bad: '\\${componentName}', good: '${componentName}' },
                { bad: '\\${requirements.components?.length ?? 0}', good: '${requirements.components?.length ?? 0}' },
                { bad: '\\${code.length}', good: '${code.length}' },
                { bad: '\\${accessibility.wcagLevel}', good: '${accessibility.wcagLevel}' },
                { bad: '\\${accessibility.score}', good: '${accessibility.score}' },
                { bad: '\\${extraContext ? `Additional context: \\${extraContext}` : \'\'}', good: '${extraContext ? `Additional context: ${extraContext}` : \'\'}' },
                { bad: '\\${frameworkInstructions[targetFramework] || frameworkInstructions.react}', good: '${frameworkInstructions[targetFramework] || frameworkInstructions.react}' },
                { bad: '\\${JSON.stringify(requirements, null, 2)}', good: '${JSON.stringify(requirements, null, 2)}' },
                { bad: '\\${code.substring(0, 3000)}', good: '${code.substring(0, 3000)}' },
                { bad: '\\${contextBlock}', good: '${contextBlock}' },
                { bad: '\\${prompt}', good: '${prompt}' },

                // Specifically for github_actions
                { bad: '\\${{ github.actor }}', good: '${{ github.actor }}' },
                { bad: '\\${{ github.event_name }}', good: '${{ github.event_name }}' },
                { bad: '\\${{ env.NODE_VERSION }}', good: '${{ env.NODE_VERSION }}' },
                { bad: '\\${{ secrets.CODECOV_TOKEN }}', good: '${{ secrets.CODECOV_TOKEN }}' },
                { bad: '\\${{ matrix.os }}', good: '${{ matrix.os }}' },
                { bad: '\\${{ matrix.node - version }}', good: '${{ matrix.node-version }}' }, // also fixing rollup parsing
                { bad: '\\${{ steps.meta.outputs.tags }}', good: '${{ steps.meta.outputs.tags }}' },
                { bad: '\\${{ steps.push.outputs.digest }}', good: '${{ steps.push.outputs.digest }}' },
                { bad: '\\${{ env.REGISTRY }}', good: '${{ env.REGISTRY }}' },
                { bad: '\\${{ secrets.GITHUB_TOKEN }}', good: '${{ secrets.GITHUB_TOKEN }}' },
                { bad: '\\${{ env.IMAGE_NAME }}', good: '${{ env.IMAGE_NAME }}' },
                { bad: '\\${{ github.event_name != \'pull_request\' }}', good: '${{ github.event_name != \'pull_request\' }}' },
                { bad: '\\${{ steps.meta.outputs.labels }}', good: '${{ steps.meta.outputs.labels }}' },
                { bad: '\\${{ secrets.PROD_HOST }}', good: '${{ secrets.PROD_HOST }}' },
                { bad: '\\${{ secrets.DEPLOY_SSH_KEY }}', good: '${{ secrets.DEPLOY_SSH_KEY }}' },
                { bad: '\\${{ needs.build - and - push.outputs.image }}', good: '${{ needs.build-and-push.outputs.image }}' },
                { bad: '\\${{ runner.os }}', good: '${{ runner.os }}' },
                { bad: '\\${{ hashFiles(\'**/package-lock.json\') }}', good: '${{ hashFiles(\'**/package-lock.json\') }}' },
                { bad: '\\${{ github.sha }}', good: '${{ github.sha }}' },
                { bad: '\\${{ github.ref_name }}', good: '${{ github.ref_name }}' },
                { bad: '\\${{ secrets.MY_SECRET }}', good: '${{ secrets.MY_SECRET }}' },
                { bad: '\\${{ vars.MY_VAR }}', good: '${{ vars.MY_VAR }}' },
                { bad: '\\${{ needs.job_id.outputs.key }}', good: '${{ needs.job_id.outputs.key }}' },
                { bad: '\\${{ github.event.inputs.environment }}', good: '${{ github.event.inputs.environment }}' },
            ];

            for (const { bad, good } of toRevert) {
                if (content.includes(bad)) {
                    content = content.split(bad).join(good);
                    modified = true;
                }
            }

            // Revert preamble escaping that didn't match the generic strings
            if (content.includes('\\${')) {
                // If it's a raw string in a template literal without being evaluated, we must escape it so the JS engine doesn't try to interpolate it.
                // Wait, if it IS being evaluated (like in `vision_to_ui._analyzeImage`), it NEEDS TO BE `${...}`.
                // Our generic script messed up everything. Let's just restore from git for the whole directory and ONLY fix what we know is broken.
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Reverted over-escaping in: ${file}`);
            }
        }
    }
}

revertOverEscaping(agentsDir);
