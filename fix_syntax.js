const fs = require('fs');

let content = fs.readFileSync('src/lib/products.ts', 'utf8');

// Find the index of the first "];" at the end of the PRODUCTS array
// Since there shouldn't be other "];" at the top level, let's just find the last "];" before the broken code.
// Actually, it's safer to just regex replace the broken part.
const brokenPart = `    return fields.some((field) => field && matchesSearch(field, query));
  });
}

export function filterProducts(products: Product[], categoryId: string): Product[] {
  if (categoryId === "all") return products;
  return products.filter((p) => p.categoryId === categoryId);
}`;

const correctPart = `
export function searchProducts(products: Product[], query: string, lang: "ar" | "en"): Product[] {
  if (!query) return products;
  const lower = query.toLowerCase();
  
  const matchesSearch = (text: string, q: string) => text && text.toLowerCase().includes(q);
  
  return products.filter((p) => {
    const fields = [
      p.nameAr, p.nameEn, p.descriptionAr, p.descriptionEn, p.brand, p.categoryId
    ];
    return fields.some((field) => matchesSearch(field, lower));
  });
}

export function filterProducts(products: Product[], categoryId: string): Product[] {
  if (categoryId === "all") return products;
  return products.filter((p) => p.categoryId === categoryId);
}
`;

content = content.replace(brokenPart, correctPart.trim());
fs.writeFileSync('src/lib/products.ts', content, 'utf8');
console.log("Fixed syntax");
