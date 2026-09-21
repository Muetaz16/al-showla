const { PRODUCTS } = require('./src/lib/products.ts');

const IMAGE_MAP = {
  waterproof: [
    { keys: ["bucket", "pail", "liquid", "seal", "107", "coat", "عازل", "سيكا"], url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80" },
    { keys: ["roll", "bitumen", "membrane", "لفائف", "رول"], url: "https://images.unsplash.com/photo-1517646287270-a5a9ca602511?w=600&q=80" }, 
    { keys: ["powder", "cement", "بودرة", "اسمنت", "جروت"], url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" }, 
    { keys: ["default"], url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80" }
  ],
  gypsum: [
    { keys: ["board", "لوح", "drywall", "gypsum"], url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80" }, 
    { keys: ["profile", "metal", "stud", "track", "بروفايل", "اوميجا", "زاوية"], url: "https://images.unsplash.com/photo-1520689626500-2f96cf938096?w=600&q=80" }, 
    { keys: ["powder", "plaster", "joint", "معجون"], url: "https://images.unsplash.com/photo-1562259942-041e8e25d083?w=600&q=80" },
    { keys: ["default"], url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80" }
  ],
  sanitary: [
    { keys: ["faucet", "mixer", "خلاط", "صنبور"], url: "https://images.unsplash.com/photo-1620626011761-55018a1ef96c?w=600&q=80" }, 
    { keys: ["toilet", "bowl", "wc", "مرحاض", "طقم حمام"], url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80" }, 
    { keys: ["basin", "sink", "حوض"], url: "https://images.unsplash.com/photo-1600566753190-17f0baa2cb32?w=600&q=80" }, 
    { keys: ["pipe", "tube", "fitting", "انبوب", "ماسورة", "كوع", "تيه"], url: "https://images.unsplash.com/photo-1617188737522-8393841a1eb7?w=600&q=80" }, 
    { keys: ["default"], url: "https://images.unsplash.com/photo-1620626011761-55018a1ef96c?w=600&q=80" }
  ],
  tools: [
    { keys: ["drill", "hammer", "rotary", "مثقاب", "مطرقة", "هيليتي", "شنيور"], url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80" }, 
    { keys: ["saw", "circular", "منشار", "قص"], url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80" }, 
    { keys: ["grinder", "angle", "صاروخ", "جلخ", "تلميع"], url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80" }, // Using saw as generic cutting tool
    { keys: ["measure", "tape", "laser", "قياس", "شريط", "متر"], url: "https://images.unsplash.com/photo-1513467655676-59c18447814b?w=600&q=80" }, 
    { keys: ["hand", "plier", "screwdriver", "wrench", "مفك", "زردية", "كماشة", "مفتاح"], url: "https://images.unsplash.com/photo-1581092921461-70093844f2fb?w=600&q=80" }, 
    { keys: ["default"], url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80" }
  ],
  steel: [
    { keys: ["rebar", "حديد", "تسليح", "سيخ"], url: "https://images.unsplash.com/photo-1585250489230-6d8b2d716d1a?w=600&q=80" }, 
    { keys: ["mesh", "شبك", "wire", "سلك"], url: "https://images.unsplash.com/photo-1520689626500-2f96cf938096?w=600&q=80" }, 
    { keys: ["default"], url: "https://images.unsplash.com/photo-1585250489230-6d8b2d716d1a?w=600&q=80" }
  ],
  flooring: [
    { keys: ["laminate", "wood", "خشب", "باركيه", "pvc", "بي في سي"], url: "https://images.unsplash.com/photo-1584622781864-4e4277717647?w=600&q=80" }, 
    { keys: ["epoxy", "resin", "ايبوكسي", "طلاء", "دهان"], url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80" }, 
    { keys: ["tile", "ceramic", "بلاط", "سيراميك"], url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80" }, 
    { keys: ["default"], url: "https://images.unsplash.com/photo-1584622781864-4e4277717647?w=600&q=80" }
  ],
  adhesives: [
    { keys: ["glue", "silicone", "لاصق", "سيليكون", "sealant", "غراء"], url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80" },
    { keys: ["tape", "شريط"], url: "https://images.unsplash.com/photo-1513467655676-59c18447814b?w=600&q=80" },
    { keys: ["default"], url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80" }
  ],
  insulation: [
    { keys: ["wool", "rock", "صوف", "صخري", "glass", "زجاجي"], url: "https://images.unsplash.com/photo-1517646287270-a5a9ca602511?w=600&q=80" }, 
    { keys: ["foam", "board", "فوم", "رغوة", "لوح"], url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80" },
    { keys: ["default"], url: "https://images.unsplash.com/photo-1517646287270-a5a9ca602511?w=600&q=80" }
  ],
  default: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80"
};

function getImage(product) {
  const cat = product.categoryId;
  const name = (product.nameEn + " " + product.nameAr).toLowerCase();
  
  if (IMAGE_MAP[cat]) {
    for (const rule of IMAGE_MAP[cat]) {
      if (rule.keys[0] === 'default') return rule.url;
      for (const k of rule.keys) {
        if (name.includes(k)) return rule.url;
      }
    }
  }
  return IMAGE_MAP.default;
}

const updatedProducts = PRODUCTS.map(p => {
  return {
    ...p,
    imageUrl: getImage(p)
  };
});

// Now we overwrite the file src/lib/products.ts
// We'll read it as text, find the array, and replace it.
const fs = require('fs');
const content = fs.readFileSync('./src/lib/products.ts', 'utf8');

const regex = /export const PRODUCTS: Product\[\] = (\[[\s\S]*\]);/;
const match = content.match(regex);

if (!match) {
  console.log("Error: could not parse file");
  process.exit(1);
}

// Custom stringifier to format it somewhat nicely like TS
let replacement = JSON.stringify(updatedProducts, null, 2);
// Remove quotes around keys
replacement = replacement.replace(/"([^"]+)":/g, "$1:");

const newContent = content.replace(regex, `export const PRODUCTS: Product[] = ${replacement};`);

fs.writeFileSync('./src/lib/products.ts', newContent, 'utf8');
console.log("Successfully updated src/lib/products.ts images for", updatedProducts.length, "products!");
