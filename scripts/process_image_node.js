const sharp = require('sharp');
const path = require('path');

const input = path.join(__dirname, '..', 'assets', 'FundoVerdeRestoPreto.jpeg');
const output = path.join(__dirname, '..', 'assets', 'FundoVerdeRestoPreto_250.jpeg');

async function run() {
  try {
    await sharp(input)
      .resize(250, 250, { fit: 'contain', background: '#06C345' })
      .flatten({ background: '#06C345' })
      .jpeg({ quality: 90 })
      .toFile(output);
    console.log('Resized saved to', output);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
