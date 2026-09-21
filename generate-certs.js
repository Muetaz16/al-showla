const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, 'public', 'certs');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

function makeCert(title, subtitle, filename) {
  const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
  doc.pipe(fs.createWriteStream(path.join(certsDir, filename)));
  
  // Draw border
  doc.rect(20, 20, 802, 555).lineWidth(10).stroke('#0051a2');
  doc.rect(25, 25, 792, 545).lineWidth(2).stroke('#f59e0b');

  doc.moveDown(3);
  doc.fontSize(40).fillColor('#0051a2').text('Certificate of Compliance', { align: 'center' });
  doc.moveDown(1.5);
  doc.fontSize(22).fillColor('#333').text(`This certifies that the products are compliant with:`, { align: 'center' });
  doc.moveDown(0.8);
  doc.fontSize(45).fillColor('#0051a2').text(title, { align: 'center' });
  
  if (subtitle) {
    doc.moveDown(0.5);
    doc.fontSize(18).fillColor('#666').text(subtitle, { align: 'center' });
  }

  doc.moveDown(2.5);
  doc.fontSize(20).fillColor('#666').text('Issued by: International Certification Authority', { align: 'center' });
  
  // Signature line
  doc.moveTo(250, 480).lineTo(400, 480).stroke('#333');
  doc.moveTo(450, 480).lineTo(600, 480).stroke('#333');
  
  doc.fontSize(15).fillColor('#333').text('Authorized Signature', 260, 490);
  doc.text('Date of Issue: 2024', 470, 490);
  
  doc.end();
}

makeCert('ISO 9001:2015', 'Quality Management System', 'iso9001.pdf');
makeCert('CE Mark', 'Declaration of Performance', 'ce.pdf');
makeCert('LEED v4', 'Green Building Certification', 'leed.pdf');
makeCert('WRAS Approval', 'Water Regulations Advisory Scheme', 'wras.pdf');
makeCert('GreenGuard', 'Low Chemical Emissions', 'greenguard.pdf');
makeCert('Standard Quality Certificate', 'International Standards', 'general.pdf');

console.log("Certificates generated successfully in public/certs/");
