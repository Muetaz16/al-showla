const fs = require('fs');
const { execSync } = require('child_process');

const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');

for (const line of lines) {
  if (!line || line.startsWith('#')) continue;
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    // Remove wrapping quotes if present
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    
    console.log(`Adding ${key}...`);
    try {
      // Create a temporary file for the value to avoid shell quoting issues
      fs.writeFileSync('temp_val.txt', val);
      execSync(`npx vercel env add ${key} production < temp_val.txt`, { stdio: 'inherit' });
    } catch (e) {
      console.log(`Failed to add ${key}`);
    }
  }
}

if (fs.existsSync('temp_val.txt')) fs.unlinkSync('temp_val.txt');
console.log('Finished adding env vars');
