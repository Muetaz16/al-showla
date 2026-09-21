const axios = require('axios');
const cheerio = require('cheerio'); // Might not be installed, let's use simple regex if so

async function fetchImage(query) {
    try {
        const res = await axios.get(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query + ' product')}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });
        
        const html = res.data;
        // Find the first image url that looks like a real image URL in the page
        // Google often includes the original image urls in a data array format like: ["https://example.com/image.jpg", 400, 300]
        const matches = [...html.matchAll(/\["([^"]+?\.jpg|[^"]+?\.png|[^"]+?\.jpeg)"/ig)];
        
        for (let match of matches) {
             const url = match[1];
             if (url && !url.includes('gstatic') && url.startsWith('http')) {
                 return url;
             }
        }
        return null;
    } catch (e) {
        console.error("Error:", e.message);
        return null;
    }
}

async function test() {
    const url = await fetchImage("Sika 107 Seal");
    console.log("Result:", url);
}

test();
