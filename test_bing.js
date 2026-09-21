async function scrapeImage(query) {
  try {
    const res = await fetch(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    // Bing images uses murl for the image url in the JSON data
    const m = html.match(/murl&quot;:&quot;(.*?)&quot;/);
    if (m && m[1]) return m[1];
    
    return null;
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log(await scrapeImage("Sika 107 Seal bucket"));
  console.log(await scrapeImage("DeWalt DWE402 angle grinder"));
  console.log(await scrapeImage("Gyproc standard plasterboard"));
}
run();
