const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/lib/products.ts',
  'temp_seed/products.js'
];

const replacements = {
  'https://beelievesourcing.co.th/wp-content/uploads/2023/05/1183273-1534x1536.jpg': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800',
  'https://bolansteel.com.sa/wp-content/uploads/2023/03/WhatsApp-Image-2023-10-18-at-1.15.38-PM-1-1140x1140.jpeg': 'https://images.unsplash.com/photo-1530982011887-3cc11cc85693?q=80&w=800',
  'https://0ksa.com/wp-content/uploads/2024/07/61gtpZ7DBTL._AC_SX569_.jpg': 'https://images.unsplash.com/photo-1541888081622-4a7b7d0d08eb?q=80&w=800'
};

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    for (const [badUrl, goodUrl] of Object.entries(replacements)) {
      if (content.includes(badUrl)) {
        content = content.split(badUrl).join(goodUrl);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
