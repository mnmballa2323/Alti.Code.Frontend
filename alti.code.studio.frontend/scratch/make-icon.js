const sharp = require('sharp');
const path = require('path');

async function createRoundedIcon() {
  const originalLogoPath = path.join(__dirname, '../public/android-chrome-512x512.png');
  const outputPath = path.join(__dirname, '../public/app-icon-rounded.png');

  // Create a 512x512 white square with rounded corners (squircle-like)
  // macOS typically uses a continuous curve, but rx/ry=115 is a standard approximation for a 512 icon
  const roundedRectSvg = `
    <svg width="512" height="512">
      <rect x="0" y="0" width="512" height="512" rx="115" ry="115" fill="white" />
    </svg>
  `;

  // Scale the original logo to be smaller so it has padding inside the box
  const resizedLogo = await sharp(originalLogoPath)
    .resize(340, 340, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  // Composite them
  await sharp(Buffer.from(roundedRectSvg))
    .composite([
      { input: resizedLogo, gravity: 'center' }
    ])
    .png()
    .toFile(outputPath);

  console.log('Successfully created app-icon-rounded.png');
}

createRoundedIcon().catch(console.error);
