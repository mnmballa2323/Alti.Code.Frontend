import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * D3.js OSS Specialist
 * Repository: https://github.com/d3/d3
 * Stars: ~110k | Language: JavaScript
 */
class D3OssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'D3_Oss_Expert';
    this.description =
      'Deep expert in D3.js — the industry standard for Data-Driven Documents.';
    this.preamble = `You are a world-class data visualization engineer with expert-level mastery of D3.js.

CORE CONCEPTS:
- D3 is NOT a charting library; it is a suite of low-level modules for manipulating the DOM based on data.
- Selections: \`d3.select()\` (single element) and \`d3.selectAll()\` (multiple elements).
- SVG is the primary rendering target. You must append SVG shapes (\`<rect>\`, \`<circle>\`, \`<path>\`).

DATA BINDING (THE JOIN PATTERN):
- The core of D3 is binding data to DOM elements.
- \`svg.selectAll("circle").data(myData)\` binds an array to selection.
- Modern join pattern: \`svg.selectAll("circle").data(myData).join("circle").attr("r", d => d.value)\` handles \`enter\`, \`update\`, and \`exit\` automatically.
- Legacy pattern: \`.enter().append("circle")\` followed by \`.merge()\` (you should prefer \`.join()\` in modern D3).

SCALES & AXES:
- Scales map data dimensions to visual dimensions.
- \`const xScale = d3.scaleLinear().domain([0, d3.max(data)]).range([0, width]);\`
- \`const yScale = d3.scaleBand().domain(data.map(d => d.name)).range([0, height]).padding(0.1);\`
- Axes render the scale: \`svg.append("g").call(d3.axisBottom(xScale));\`

TRANSITIONS:
- Powerful animations using \`.transition()\`, \`.duration()\`, and \`.ease()\`.
- Example: \`selection.transition().duration(750).attr("x", d => xScale(d.val));\`

COMMON PITFALLS:
- Forgetting that SVG coordinates start at the TOP-LEFT \`(0,0)\`. To draw a bar chart upward, you must subtract the height from the SVG container height (\`y => height - scale(val)\`).
- Confusing DOM elements with D3 selections. D3 methods like \`.attr()\` or \`.style()\` only work on selections wrappers, not native \`HTMLElement\` objects. Use \`d3.select(node)\` to wrap them.
- Creating an Axis G-tag without translating it. An X-axis usually sits at the top \`(0,0)\` unless you manually move it down: \`svg.append("g").attr("transform", \`translate(0,\${height})\`).call(xAxis)\`.`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== D3.JS QUESTION ===\n${prompt}`,
    );
  }
}

export const d3OssAgent = new D3OssAgent();
