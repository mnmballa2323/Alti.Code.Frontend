const fs = require('fs');
const file = '/Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.frontend/components/sidebar.tsx';
let data = fs.readFileSync(file, 'utf8');

const startMarker = '  const content = (';
const endMarker = '  return (\n    <div className="flex sticky h-full">';

const startIndex = data.indexOf(startMarker);
const endIndex = data.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find markers!");
  process.exit(1);
}

// We need to extract the parts we want to keep
// 1. Dropdown
// 2. Nav buttons
// 3. History block
// 4. Login buttons

// It's easier to just do a string replacement of the specific chunks.
