import { describe, it, expect, vi, beforeEach } from 'vitest';
import { designerAgent } from './shards/d/designer.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { visionService } from '../senses/vision.service.js';

vi.mock('../gemini/gemini.service.js');
vi.mock('../senses/vision.service.js');

describe('Live Environment Perception (Phase 18 - Visual TDD)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock the disk write to prevent actual IO during unit tests
        designerAgent._mockWriteToDisk = vi.fn().mockResolvedValue(true);
    });

    it('should iterate UI code if Gemini Vision rejects the rendered Puppeteer screenshot', async () => {

        // ROUND 1: Bad code -> Screenshot -> Vision Critique
        GeminiAiService.generateContent
            // Round 1 Code Generation
            .mockResolvedValueOnce(`
export default function Button() {
    return <button className="bg-white text-white">Submit</button>
}
            `)
            // Round 2 Code Generation (Fixed)
            .mockResolvedValueOnce(`
export default function Button() {
    return <button className="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
}
            `);

        // Mock Puppeteer capturing *something*
        visionService.capturePage.mockResolvedValue(Buffer.from('fake-png-data'));

        // Mock Gemini Vision analyzing the screenshot
        visionService.analyze
            // Round 1 Vision Critique
            .mockResolvedValueOnce(`The button has white text on a white background, making it invisible. It also lacks padding. Change the background to blue and add px-4 py-2.`)
            // Round 2 Vision Critique
            .mockResolvedValueOnce('APPROVE');

        const result = await designerAgent.designPixelPerfect(
            'Create a blue submit button with white text and rounded corners.',
            '/mock/frontend/app/preview/page.tsx',
            'http://localhost:3000/preview'
        );

        // Assertions
        expect(DesignerAgent_IO_mockCalled(designerAgent._mockWriteToDisk)).toBe(true);

        // 2 Code generation calls
        expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(2);

        // 2 Puppeteer captures
        expect(visionService.capturePage).toHaveBeenCalledTimes(2);
        expect(visionService.capturePage).toHaveBeenCalledWith('http://localhost:3000/preview');

        // 2 Vision critiques
        expect(visionService.analyze).toHaveBeenCalledTimes(2);

        expect(result.success).toBe(true);
        expect(result.loops).toBe(2);

        // Assert the final code contains the visual fixes
        expect(result.code).toContain('bg-blue-500');
        expect(result.code).toContain('px-4 py-2');
    });

    it('should immediately approve a visually perfect render', async () => {

        GeminiAiService.generateContent.mockResolvedValueOnce(`
export default function Hero() {
    return <div className="text-4xl font-bold">Welcome</div>
}
        `);

        visionService.capturePage.mockResolvedValue(Buffer.from('fake-png-data'));
        visionService.analyze.mockResolvedValueOnce('APPROVE');

        const result = await designerAgent.designPixelPerfect('Create a large welcome hero.', '/a/b.tsx', 'http://a');

        expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);
        expect(visionService.analyze).toHaveBeenCalledTimes(1);
        expect(result.success).toBe(true);
        expect(result.loops).toBe(1);
    });
});

// Helper for assertions on mocked methods inside the class instance
function DesignerAgent_IO_mockCalled(mockedFn) {
    return mockedFn.mock.calls.length > 0;
}
