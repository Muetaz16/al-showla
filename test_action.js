const https = require('https');

const data = JSON.stringify([]);

const options = {
  hostname: 'alshowla.vercel.app',
  port: 443,
  path: '/products',
  method: 'POST',
  headers: {
    'Next-Action': 'b312b6df527e7d956a8fb739be657bb649c25b42', // I need the actual Action ID, but without it I can just request the page
    'Content-Type': 'text/plain;charset=UTF-8',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
