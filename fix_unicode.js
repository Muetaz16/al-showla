const fs = require('fs');
let c = fs.readFileSync('src/app/admin/page.tsx', 'utf8');
// Use a regex that matches \uXXXX and replaces consecutive ones as a single JSON string
c = c.replace(/(?:\\u[0-9a-fA-F]{4})+/g, match => {
  try {
    return JSON.parse('"' + match + '"');
  } catch(e) {
    return match;
  }
});
fs.writeFileSync('src/app/admin/page.tsx', c);
console.log("Done");
