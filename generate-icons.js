const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const sizes = [192, 512];
  const inputSvg = path.join(__dirname, 'frontend', 'icons', 'app-icon.svg');
  
  for (const size of sizes) {
    const outputPng = path.join(__dirname, 'frontend', 'icons', `icon-${size}x${size}.png`);
    
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(outputPng);
    
    console.log(`Generated icon: ${outputPng}`);
  }
}

generateIcons().catch(err => console.error('Error generating icons:', err));