const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Chemin vers le SVG source
const inputPath = path.resolve(__dirname, 'src/icons/icon.svg');

// Dossier de sortie pour les icônes
const outputDir = path.resolve(__dirname, 'src/icons');

// Tailles des icônes à générer
const sizes = [16, 32, 48, 128];

// Vérifier que le fichier SVG existe
if (!fs.existsSync(inputPath)) {
  console.error('SVG source file not found:', inputPath);
  process.exit(1);
}

// Créer le dossier de sortie s'il n'existe pas
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Générer les PNG
sizes.forEach((size) => {
  const outputPath = path.resolve(outputDir, `icon${size}.png`);
  sharp(inputPath)
    .resize(size, size)
    .toFile(outputPath, (err, info) => {
      if (err) {
        console.error(`Error generating icon${size}.png:`, err);
      } else {
        console.log(`Generated icon${size}.png`, info);
      }
    });
});
