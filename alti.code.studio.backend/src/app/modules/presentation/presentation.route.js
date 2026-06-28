import express from 'express';
import pptxgen from 'pptxgenjs/dist/pptxgen.cjs.js';
import { executeVertexImagen } from '../ai/vertex_ai.helper.js';
import { multiCloudInferenceService } from '../ai/multicloud_inference.service.js';

const router = express.Router();

// Helper to sanitize JSON response from LLM
function cleanJSONString(str) {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  }
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// 1. Preview Endpoint: Call Vertex AI and Imagen to generate presentation structure and image assets
router.post('/preview', async (req, res) => {
  try {
    const {
      title = 'System Architecture Review',
      subtitle = 'Enterprise Swarms & Ingestion Context',
      prompt = '',
      strategistMode = 'Technical Deep Dive',
      visualStyle = 'Sleek Dark Mode',
      selectedContext = [],
      modelId = 'gemini-2.5-pro', // mix of models supported
    } = req.body;

    const llmPrompt = `Generate a structured presentation slide deck titled "${title}" with subtitle "${subtitle}".
The strategist style is: ${strategistMode}.
User objectives / request details: ${prompt}.
Attached workspace context: ${selectedContext.join(', ') || 'No attached context'}.

You MUST return a valid JSON object matching the following format exactly (no markdown backticks, no trailing commas):
{
  "slides": [
    {
      "type": "title",
      "tag": "${strategistMode.toUpperCase()}",
      "title": "${title}",
      "subtitle": "${subtitle}"
    },
    {
      "type": "two-column",
      "title": "Executive Overview",
      "col1Title": "Core Objectives",
      "col1Content": "Detailed description of goals based on prompt...",
      "col2Title": "Key Targets",
      "col2Content": [
        "Actionable target 1",
        "Actionable target 2",
        "Actionable target 3"
      ],
      "imagePrompt": "Sleek minimal tech illustration showing cloud roadmap timeline, vector, dark background"
    },
    {
      "type": "context-list",
      "title": "System & Connected Context",
      "items": [
        "Workspace context element 1 description",
        "Workspace context element 2 description",
        "Workspace context element 3 description"
      ],
      "imagePrompt": "Sleek minimal tech illustration showing database schema cylinders connection, vector, dark background"
    },
    {
      "type": "bullets-card",
      "title": "Operational Safety & Guardrails",
      "bullets": [
        "Tuned guardrail constraint summarizing project rules",
        "API boundary validation limits",
        "Sovereign cloud compliance checkpoint"
      ],
      "imagePrompt": "Sleek minimal tech illustration showing firewall secure check shield, vector, dark background"
    },
    {
      "type": "roadmap-steps",
      "title": "Implementation Roadmap",
      "steps": [
        { "num": "01", "title": "Initialization Phase", "desc": "Phase details..." },
        { "num": "02", "title": "Stitching Layer", "desc": "Phase details..." },
        { "num": "03", "title": "Swarm Deployments", "desc": "Phase details..." }
      ],
      "imagePrompt": "Sleek minimal tech illustration showing software compile release nodes, vector, dark background"
    }
  ]
}`;

    console.log(`[Presentation] Generating slide structure using model ${modelId}...`);
    let textResponse = '';
    try {
      const llmResult = await multiCloudInferenceService.executeMultiCloudInference(
        llmPrompt,
        'presentation_generator',
        {
          preferredProvider: 'azure',
          modelId: modelId.includes('gpt') ? modelId : 'gpt-5.5-pro',
        }
      );
      textResponse = llmResult.content;
    } catch (llmErr) {
      console.warn('[Presentation] Multi-cloud slide inference failed, using fallback:', llmErr.message);
      throw llmErr;
    }
    
    let slideStructure;
    try {
      const cleanedJson = cleanJSONString(textResponse);
      slideStructure = JSON.parse(cleanedJson);
    } catch (parseErr) {
      console.warn('[Presentation] LLM JSON parsing failed, using high-fidelity fallback:', parseErr.message);
      // High-fidelity fallback structure
      slideStructure = {
        slides: [
          {
            type: "title",
            tag: strategistMode.toUpperCase(),
            title: title,
            subtitle: subtitle,
          },
          {
            type: "two-column",
            title: "Executive Overview",
            col1Title: "Core Objectives",
            col1Content: prompt || "Synthesize technical project specs and compile actionable targets.",
            col2Title: "Key Targets",
            col2Content: [
              "Deploy scalable infrastructure layers",
              "Enforce enterprise security guardrails",
              "Automate testing & release integrations"
            ],
            imagePrompt: "timeline roadmap diagram illustration"
          },
          {
            type: "context-list",
            title: "Architecture & Connected Context",
            items: selectedContext.length > 0 ? selectedContext : [
              "Default Workspace Project",
              "Active Database Layer",
              "Secure Sandbox API"
            ],
            imagePrompt: "database cylinder connections diagram"
          },
          {
            type: "bullets-card",
            title: "Operational Safety & Guardrails",
            bullets: [
              "Programmatic input validation scrubs query scripts before executions.",
              "Strict sovereign boundary routes block foundational cloud data leaks.",
              "Automated policy evaluations trigger container rolling updates on failure."
            ],
            imagePrompt: "secure check shield diagram"
          },
          {
            type: "roadmap-steps",
            title: "Implementation Roadmap",
            steps: [
              { num: "01", title: "Compile & Test", desc: "Verify schemas and build mocks." },
              { num: "02", title: "Stitch Visuals", desc: "Deploy visual token rules." },
              { num: "03", title: "Provisioning", desc: "Configure cloud workloads." }
            ],
            imagePrompt: "roadmap release timeline nodes diagram"
          }
        ]
      };
    }

    // 2. Call Imagen model in parallel to generate custom illustration images
    console.log('[Presentation] Triggering Vertex AI Imagen calls for slides...');
    const imagePromises = slideStructure.slides.map(async (slide) => {
      if (slide.imagePrompt) {
        try {
          const imageBase64 = await executeVertexImagen(slide.imagePrompt, { aspectRatio: '1:1' });
          return { ...slide, image: imageBase64 };
        } catch (imgErr) {
          console.warn(`[Presentation] Imagen call failed for "${slide.imagePrompt}":`, imgErr.message);
          return slide;
        }
      }
      return slide;
    });

    const slidesWithImages = await Promise.all(imagePromises);
    res.json({ slides: slidesWithImages });

  } catch (error) {
    console.error('[PresentationRoutes] Slide structure preview generation error:', error);
    res.status(500).json({ error: 'Failed to preview generated slide structure.' });
  }
});

// 2. Generate and Download endpoint: compiles the actual client-confirmed slides JSON into PPTX
router.post('/generate', async (req, res) => {
  try {
    const {
      title = 'Untitled Presentation',
      subtitle = 'Alti Code Studio Deck',
      visualStyle = 'Sleek Dark Mode',
      slides = [],
    } = req.body;

    const pptx = new pptxgen();
    pptx.title = title;

    // Define colors based on the visual style
    const isDark = visualStyle === 'Sleek Dark Mode';
    
    // Background and Accent Colors
    const bgHex = isDark ? '0A0A0B' : 'F8FAFC';
    const cardBgHex = isDark ? '121218' : 'FFFFFF';
    const textHex = isDark ? 'FFFFFF' : '0F172A';
    const mutedTextHex = isDark ? '94A3B8' : '64748B';
    
    let accentHex = '8B5CF6'; // Default Purple
    if (visualStyle === 'Corporate Grid') accentHex = '2563EB'; // Corporate Blue
    if (visualStyle === 'Sovereign Minimalist') accentHex = '111827'; // Midnight Black

    // Loop through generated slides to compile the PowerPoint presentation
    slides.forEach((slide) => {
      const pptxSlide = pptx.addSlide();
      pptxSlide.background = { fill: bgHex };

      // Left brand line
      pptxSlide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 0.15,
        h: 5.625,
        fill: { color: accentHex },
      });

      if (slide.type === 'title') {
        // Tag label
        pptxSlide.addText(slide.tag || 'PRESENTATION SWARM', {
          x: 0.8,
          y: 1.5,
          w: 8.4,
          h: 0.4,
          fontSize: 11,
          bold: true,
          color: accentHex,
          fontFace: 'Helvetica Neue',
        });

        // Main Title
        pptxSlide.addText(slide.title || title, {
          x: 0.8,
          y: 2.0,
          w: 8.4,
          h: 1.2,
          fontSize: 36,
          bold: true,
          color: textHex,
          fontFace: 'Helvetica Neue',
        });

        // Subtitle
        pptxSlide.addText(slide.subtitle || subtitle, {
          x: 0.8,
          y: 3.3,
          w: 8.4,
          h: 0.6,
          fontSize: 16,
          color: mutedTextHex,
          fontFace: 'Helvetica Neue',
        });

        // Footer signature
        pptxSlide.addText('Compiled via Alti Code Studio Presentation Swarm', {
          x: 0.8,
          y: 4.8,
          w: 8.0,
          h: 0.4,
          fontSize: 10,
          color: mutedTextHex,
          fontFace: 'Helvetica Neue',
          italic: true,
        });
      }

      else if (slide.type === 'two-column') {
        pptxSlide.addText(slide.title, {
          x: 0.8,
          y: 0.5,
          w: 8.4,
          h: 0.5,
          fontSize: 22,
          bold: true,
          color: textHex,
          fontFace: 'Helvetica Neue',
        });

        // Column 1 Box
        pptxSlide.addShape(pptx.ShapeType.rect, {
          x: 0.8,
          y: 1.3,
          w: 2.8,
          h: 3.6,
          fill: { color: cardBgHex },
          line: { color: isDark ? '2A2A35' : 'E2E8F0', width: 1 },
        });
        pptxSlide.addText(slide.col1Title || 'Objectives', {
          x: 1.0,
          y: 1.5,
          w: 2.4,
          h: 0.4,
          fontSize: 14,
          bold: true,
          color: accentHex,
        });
        pptxSlide.addText(slide.col1Content || '', {
          x: 1.0,
          y: 2.0,
          w: 2.4,
          h: 2.6,
          fontSize: 11,
          color: textHex,
          lineSpacing: 18,
        });

        // Column 2 Box
        pptxSlide.addShape(pptx.ShapeType.rect, {
          x: 3.8,
          y: 1.3,
          w: 2.8,
          h: 3.6,
          fill: { color: cardBgHex },
          line: { color: isDark ? '2A2A35' : 'E2E8F0', width: 1 },
        });
        pptxSlide.addText(slide.col2Title || 'Key Targets', {
          x: 4.0,
          y: 1.5,
          w: 2.4,
          h: 0.4,
          fontSize: 14,
          bold: true,
          color: accentHex,
        });

        const bulletLines = Array.isArray(slide.col2Content) 
          ? slide.col2Content.map(line => ({ text: line })) 
          : [];
        pptxSlide.addText(bulletLines, {
          x: 4.0,
          y: 2.0,
          w: 2.4,
          h: 2.6,
          fontSize: 11,
          color: textHex,
          bullet: true,
          lineSpacing: 24,
        });

        // Image Slot (Column 3)
        if (slide.image) {
          pptxSlide.addImage({
            data: slide.image,
            x: 6.8,
            y: 1.3,
            w: 2.8,
            h: 3.6,
          });
        } else {
          pptxSlide.addShape(pptx.ShapeType.rect, {
            x: 6.8,
            y: 1.3,
            w: 2.8,
            h: 3.6,
            fill: { color: cardBgHex },
            line: { color: isDark ? '2A2A35' : 'E2E8F0', width: 1 },
          });
          pptxSlide.addText('Illustration Asset', {
            x: 6.8,
            y: 2.8,
            w: 2.8,
            h: 0.4,
            fontSize: 11,
            color: mutedTextHex,
            align: 'center',
          });
        }
      }

      else if (slide.type === 'context-list') {
        pptxSlide.addText(slide.title, {
          x: 0.8,
          y: 0.5,
          w: 8.4,
          h: 0.5,
          fontSize: 22,
          bold: true,
          color: textHex,
          fontFace: 'Helvetica Neue',
        });

        // Render context rows
        const items = Array.isArray(slide.items) ? slide.items : [];
        items.forEach((item, index) => {
          const yOffset = 1.3 + (index * 1.15);
          if (index < 3) {
            pptxSlide.addShape(pptx.ShapeType.rect, {
              x: 0.8,
              y: yOffset,
              w: 5.8,
              h: 0.95,
              fill: { color: cardBgHex },
              line: { color: isDark ? '2A2A35' : 'E2E8F0', width: 1 },
            });
            // Left color bar
            pptxSlide.addShape(pptx.ShapeType.rect, {
              x: 0.8,
              y: yOffset,
              w: 0.12,
              h: 0.95,
              fill: { color: accentHex },
            });
            pptxSlide.addText(item, {
              x: 1.1,
              y: yOffset + 0.22,
              w: 5.2,
              h: 0.5,
              fontSize: 12,
              bold: true,
              color: textHex,
            });
          }
        });

        // Image Slot (Right)
        if (slide.image) {
          pptxSlide.addImage({
            data: slide.image,
            x: 6.8,
            y: 1.3,
            w: 2.8,
            h: 3.6,
          });
        }
      }

      else if (slide.type === 'bullets-card') {
        pptxSlide.addText(slide.title, {
          x: 0.8,
          y: 0.5,
          w: 8.4,
          h: 0.5,
          fontSize: 22,
          bold: true,
          color: textHex,
          fontFace: 'Helvetica Neue',
        });

        // Card box
        pptxSlide.addShape(pptx.ShapeType.rect, {
          x: 0.8,
          y: 1.3,
          w: 5.8,
          h: 3.6,
          fill: { color: cardBgHex },
          line: { color: isDark ? '2A2A35' : 'E2E8F0', width: 1 },
        });

        const bulletLines = Array.isArray(slide.bullets) 
          ? slide.bullets.map(line => ({ text: line })) 
          : [];
        pptxSlide.addText(bulletLines, {
          x: 1.1,
          y: 1.6,
          w: 5.2,
          h: 3.0,
          fontSize: 12,
          color: textHex,
          bullet: true,
          lineSpacing: 36,
        });

        // Image Slot (Right)
        if (slide.image) {
          pptxSlide.addImage({
            data: slide.image,
            x: 6.8,
            y: 1.3,
            w: 2.8,
            h: 3.6,
          });
        }
      }

      else if (slide.type === 'roadmap-steps') {
        pptxSlide.addText(slide.title, {
          x: 0.8,
          y: 0.5,
          w: 8.4,
          h: 0.5,
          fontSize: 22,
          bold: true,
          color: textHex,
          fontFace: 'Helvetica Neue',
        });

        const steps = Array.isArray(slide.steps) ? slide.steps : [];
        steps.forEach((step, index) => {
          const xOffset = 0.8 + (index * 1.95);
          if (index < 3) {
            pptxSlide.addShape(pptx.ShapeType.rect, {
              x: xOffset,
              y: 1.3,
              w: 1.8,
              h: 3.6,
              fill: { color: cardBgHex },
              line: { color: isDark ? '2A2A35' : 'E2E8F0', width: 1 },
            });
            // Number
            pptxSlide.addText(step.num || `0${index + 1}`, {
              x: xOffset + 0.15,
              y: 1.5,
              w: 1.5,
              h: 0.4,
              fontSize: 24,
              bold: true,
              color: accentHex,
            });
            // Step title
            pptxSlide.addText(step.title || '', {
              x: xOffset + 0.15,
              y: 2.1,
              w: 1.5,
              h: 0.4,
              fontSize: 12,
              bold: true,
              color: textHex,
            });
            // Step desc
            pptxSlide.addText(step.desc || '', {
              x: xOffset + 0.15,
              y: 2.6,
              w: 1.5,
              h: 2.1,
              fontSize: 10,
              color: mutedTextHex,
              lineSpacing: 16,
            });
          }
        });

        // Image Slot (Right)
        if (slide.image) {
          pptxSlide.addImage({
            data: slide.image,
            x: 6.8,
            y: 1.3,
            w: 2.8,
            h: 3.6,
          });
        }
      }
    });

    const buffer = await pptx.write('nodebuffer');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(title.replace(/\s+/g, '_'))}.pptx"`);
    res.send(buffer);

  } catch (error) {
    console.error('[PresentationRoutes] PPTX generation error:', error);
    res.status(500).json({ error: 'Failed to compile PowerPoint presentation.' });
  }
});

export const presentationRoutes = router;
