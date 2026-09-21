const fs = require('fs');

const path = 'C:/Users/gemini/.gemini/antigravity/brain/0606fc5e-5911-4d65-bc4b-d36bce028fb9/.system_generated/logs/transcript_full.jsonl';
const localPath = 'C:/Users/muner/.gemini/antigravity/brain/0606fc5e-5911-4d65-bc4b-d36bce028fb9/.system_generated/logs/transcript_full.jsonl';

const finalPath = fs.existsSync(localPath) ? localPath : path;
if (!fs.existsSync(finalPath)) {
  console.log('Transcript file does not exist');
  process.exit(1);
}

const content = fs.readFileSync(finalPath, 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  
  if (line.includes('wp-001') && line.includes('Sikatop-107 Seal') && line.includes('write_to_file')) {
    console.log(`Line ${i} contains the original products list!`);
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (const tc of obj.tool_calls) {
          if (tc.name === 'write_to_file' && tc.args.TargetFile.includes('products.ts')) {
            fs.writeFileSync('original_products_only.ts', tc.args.CodeContent);
            console.log('Successfully extracted original products');
            process.exit(0);
          }
        }
      }
    } catch(e) {
      console.log('JSON parse failed, doing regex...');
      const match = line.match(/"CodeContent":"(.*?)"\s*,\s*"Description"/);
      if (match) {
        fs.writeFileSync('original_products_only.ts', match[1].replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
        console.log('Extracted original products via regex!');
        process.exit(0);
      }
    }
  }
}

console.log('Not found');
