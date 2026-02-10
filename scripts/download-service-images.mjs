import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const serviceImages = [
  // Portes (Doors) - Moroccan carved wooden door
  {
    path: 'public/images/services/portes.jpg',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80'
  },
  // Fenêtres (Windows) - Wooden window/shutter
  {
    path: 'public/images/services/fenetres.jpg',
    url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop&q=80'
  },
  // Mobilier (Furniture) - Custom wooden furniture
  {
    path: 'public/images/services/mobilier.jpg',
    url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&q=80'
  },
  // Escaliers (Stairs) - Wooden staircase
  {
    path: 'public/images/services/escaliers.jpg',
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=80'
  },
  // Plafonds (Ceilings) - Wooden ceiling
  {
    path: 'public/images/services/plafonds.jpg',
    url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop&q=80'
  },
  // Restauration (Restoration) - Wood restoration/crafting
  {
    path: 'public/images/services/restauration.jpg',
    url: 'https://images.unsplash.com/photo-1597348989645-e6eb10bb5fc9?w=800&h=600&fit=crop&q=80'
  },
];

function downloadWithRedirect(url, filepath) {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(__dirname, '..', filepath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(fullPath);

    function followRedirect(currentUrl) {
      https.get(currentUrl, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            followRedirect(redirectUrl);
          } else {
            reject(new Error('Redirect without location header'));
          }
        } else if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        } else {
          reject(new Error(`HTTP ${response.statusCode}`));
        }
      }).on('error', (err) => {
        fs.unlink(fullPath, () => {});
        reject(err);
      });
    }

    followRedirect(url);
  });
}

async function main() {
  console.log('🖼️  Downloading service images from Unsplash...\n');

  let success = 0;
  let failed = 0;

  for (const img of serviceImages) {
    try {
      await downloadWithRedirect(img.url, img.path);
      console.log(`✅ Downloaded: ${img.path}`);
      success++;
      // Rate limit to avoid being blocked
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.log(`❌ Failed: ${img.path} - ${e.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Completed: ${success} downloaded, ${failed} failed`);
}

main().catch(console.error);
