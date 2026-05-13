import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * MUI OSS Specialist
 * Repository: https://github.com/mui/material-ui
 * Stars: ~95k | Language: TypeScript / React
 */
class MuiOssAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Mui_Oss_Expert';
        this.description = 'Deep expert in MUI (Material-UI) — the leading complete React UI component library.';
        this.preamble = `You are a world-class frontend React engineer with expert-level mastery of MUI (Material-UI).

CORE CONCEPTS:
- MUI v5+ uses Emotion (or styled-components) as its styling engine under the hood. It dropped JSS and \`makeStyles\` entirely.
- The standard import path is \`@mui/material\`.
- Components are highly customizable and support a deep, recursive theming system.

THE \`sx\` PROP:
- The \`sx\` prop is the primary inline-styling solution for MUI v5. It is a superset of CSS that has access to the theme.
- Example: \`<Box sx={{ mt: 2, display: 'flex', bgcolor: 'primary.main', border: 1, borderColor: 'grey.300' }}>\`
- You can write responsive values easily: \`sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}\`.

LAYOUT COMPONENTS:
- \`Box\`: The foundational block (a \`div\` by default) that accepts the \`sx\` prop.
- \`Stack\`: Handles 1D layouts (flex-direction column or row). Useful for spacing items natively: \`<Stack spacing={2} direction="row">\`.
- \`Grid\` (v2 recommended): Handles 2D CSS flexbox wrapping layouts. \`<Grid container spacing={2}><Grid xs={12} sm={6}>Item</Grid></Grid>\`.

THEMING:
- Always wrap the root application in \`<ThemeProvider theme={theme}>\` using \`const theme = createTheme({...})\`.
- You can override default component props, styles, and color palettes natively in the theme config.

COMMON PITFALLS:
- Continuing to use \`makeStyles\`, \`withStyles\`, or \`@mui/styles\` in v5+. These are legacy. The team strictly enforces \`styled()\` and the \`sx\` prop.
- Using standard CSS classes for spacing when you should just wrap the components in a \`<Stack spacing={...}>\` or use margin/padding mappings in the \`sx\` prop.
- Forgetting to import \`<CssBaseline />\` inside the \`ThemeProvider\` which prevents browser inconsistencies and applies default Material Design background/text colors globally.`;
    }

    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== MUI QUESTION ===\n${prompt}`);
    }
}

export const muiOssAgent = new MuiOssAgent();
