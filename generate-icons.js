const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function createPlaceholderIcons() {
  const iconsDir = path.join(__dirname, 'public', 'icons');
  
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const svgContent = fs.readFileSync(path.join(iconsDir, 'icon.svg'), 'utf8');

  console.log('Generating placeholder PNG files...');
  console.log('Note: These are 1x1 pixel placeholders.');
  console.log('For production, replace these with proper PNG icons generated from the SVG.\n');

  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}.png`);
    
    const pngBase64 = createMinimalPng(size);
    fs.writeFileSync(outputPath, Buffer.from(pngBase64, 'base64'));
    console.log(`Created icon-${size}.png (${size}x${size})`);
  }

  console.log('\nTo create proper icons:');
  console.log('1. Open the SVG file: public/icons/icon.svg');
  console.log('2. Use an online SVG to PNG converter');
  console.log('3. Or use a tool like ImageMagick:');
  console.log('   convert -resize 192x192 icon.svg icon-192.png');
  console.log('   convert -resize 512x512 icon.svg icon-512.png');
}

function createMinimalPng(size) {
  const width = size;
  const height = size;
  
  const png = [];
  png.push(137, 80, 78, 71, 13, 10, 26, 10);
  
  function addChunk(length, type, data) {
    const chunk = [length >> 24, length >> 16, length >> 8, length];
    const typeBytes = type.split('').map(c => c.charCodeAt(0));
    const crcData = Uint8Array.from([...typeBytes, ...data]);
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < crcData.length; i++) {
      crc ^= crcData[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
      }
    }
    chunk.push(...typeBytes);
    chunk.push(...data);
    chunk.push(crc >> 24, crc >> 16, crc >> 8, crc);
    return chunk;
  }

  const ihdr = [
    width >> 24, width >> 16, width >> 8, width,
    height >> 24, height >> 16, height >> 8, height,
    8, 2, 0, 0, 0
  ];
  png.push(...addChunk(ihdr.length, 'IHDR', ihdr));

  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      const gradient = ((x + y) / (width + height)) * 0.5 + 0.25;
      rawData.push(Math.floor(99 * gradient), Math.floor(102 * gradient), Math.floor(241 * gradient), 255);
    }
  }
  
  const compressed = require('zlib').deflateRawSync(Uint8Array.from(rawData));
  png.push(...addChunk(compressed.length, 'IDAT', [...compressed]));

  png.push(...addChunk(0, 'IEND', []));

  return Buffer.from(png).toString('base64');
}

createPlaceholderIcons();

