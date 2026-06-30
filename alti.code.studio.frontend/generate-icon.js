const sharp = require('sharp');
const path = require('path');

const run = async () => {
    try {
        const inputPath = path.join(__dirname, 'public/logo-black.png');
        const outputPath = path.join(__dirname, 'public/mac-dock-icon.png');
        
        // Create a white squircle using SVG
        // macOS Big Sur icon size is usually 1024x1024, the squircle corner radius is roughly 22.5% of the width (e.g. 230px for 1024x1024)
        const size = 1024;
        const r = size * 0.225;
        
        const svgBackground = `
          <svg width="${size}" height="${size}">
            <rect x="0" y="0" width="${size}" height="${size}" rx="${r}" ry="${r}" fill="white" />
          </svg>
        `;

        // Scale the logo to fit nicely inside the box, say 65% of the size
        const logoSize = Math.floor(size * 0.65);
        
        const logoBuffer = await sharp(inputPath)
            .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .toBuffer();

        await sharp(Buffer.from(svgBackground))
            .composite([{ input: logoBuffer, gravity: 'center' }])
            .png()
            .toFile(outputPath);
            
        console.log("Successfully created mac-dock-icon.png");
    } catch(err) {
        console.error(err);
    }
};
run();
