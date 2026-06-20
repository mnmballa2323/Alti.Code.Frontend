/**
 * Parses a Markdown document with YAML frontmatter following the Open Knowledge Format (OKF) spec.
 * @param {string} content - Raw markdown content
 * @returns {object} Parsed document with frontmatter, body, sections, and citations.
 */
export function parseOKF(content) {
    if (!content) {
        return { frontmatter: {}, body: '', sections: {}, citations: [] };
    }

    const parts = content.split('---');
    // OKF file starts with --- followed by frontmatter, followed by --- and then body.
    if (parts.length < 3) {
        // No frontmatter, treat as plain text body
        return { frontmatter: {}, body: content, sections: parseSections(content), citations: parseCitations(content) };
    }

    const yamlContent = parts[1];
    const body = parts.slice(2).join('---').trim();
    const frontmatter = {};

    // Basic YAML frontmatter parser
    const lines = yamlContent.split('\n');
    for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine || cleanLine.startsWith('#')) continue;
        
        const colonIdx = cleanLine.indexOf(':');
        if (colonIdx !== -1) {
            const key = cleanLine.slice(0, colonIdx).trim();
            let val = cleanLine.slice(colonIdx + 1).trim();

            // Parse YAML lists: tags: [sales, order]
            if (val.startsWith('[') && val.endsWith(']')) {
                val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
            } else {
                val = val.replace(/^['"]|['"]$/g, '');
            }
            frontmatter[key] = val;
        }
    }

    const sections = parseSections(body);
    const citations = parseCitations(body);

    return {
        frontmatter,
        body,
        sections,
        citations
    };
}

/**
 * Validates whether the parsed frontmatter conforms to OKF specification rules.
 * @param {object} frontmatter - Parsed frontmatter
 * @returns {object} Validation result { isValid: boolean, error: string|null }
 */
export function validateOKF(frontmatter) {
    if (!frontmatter || typeof frontmatter !== 'object') {
        return { isValid: false, error: 'Frontmatter is required and must be an object.' };
    }

    if (!frontmatter.type) {
        return { isValid: false, error: "Required field 'type' is missing in the OKF frontmatter." };
    }

    return { isValid: true, error: null };
}

/**
 * Extracts sections from the Markdown body by headers.
 * @param {string} body - The Markdown body
 * @returns {object} Keyed sections of markdown content
 */
function parseSections(body) {
    const sections = {};
    const headingRegex = /^#+\s+(.+)$/gm;
    let match;
    const headings = [];

    while ((match = headingRegex.exec(body)) !== null) {
        headings.push({
            title: match[1].trim(),
            index: match.index,
            length: match[0].length
        });
    }

    for (let i = 0; i < headings.length; i++) {
        const start = headings[i].index + headings[i].length;
        const end = (i + 1 < headings.length) ? headings[i + 1].index : body.length;
        const sectionContent = body.slice(start, end).trim();
        sections[headings[i].title.toLowerCase()] = sectionContent;
    }

    return sections;
}

/**
 * Parses conventional OKF citations section.
 * @param {string} body - The Markdown body
 * @returns {Array} List of extracted citation sources
 */
function parseCitations(body) {
    const citations = [];
    const citationRegex = /\[(\d+)\]\s+\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = citationRegex.exec(body)) !== null) {
        citations.push({
            index: parseInt(match[1], 10),
            title: match[2].trim(),
            url: match[3].trim()
        });
    }

    // Secondary parsing for direct links in Citations section
    const lines = body.split('\n');
    let inCitationsSection = false;
    for (const line of lines) {
        if (line.trim().startsWith('#') && line.toLowerCase().includes('citation')) {
            inCitationsSection = true;
            continue;
        }
        if (inCitationsSection && line.trim().startsWith('#')) {
            inCitationsSection = false;
        }
        if (inCitationsSection) {
            const linkMatch = /^\s*[-*+]\s+\[([^\]]+)\]\(([^)]+)\)/.exec(line);
            if (linkMatch) {
                citations.push({
                    title: linkMatch[1].trim(),
                    url: linkMatch[2].trim()
                });
            }
        }
    }

    return citations;
}
