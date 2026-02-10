import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const serviceImages = [
  // PORTES (Doors) - 6 images
  { path: 'public/images/services/portes/portes-1.jpg', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/portes/portes-2.jpg', url: 'https://images.unsplash.com/photo-1506377295352-e3154d43ea9e?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/portes/portes-3.jpg', url: 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/portes/portes-4.jpg', url: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/portes/portes-5.jpg', url: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/portes/portes-6.jpg', url: 'https://images.unsplash.com/photo-1505577058444-a3dab90d4253?w=800&h=600&fit=crop&q=80' },

  // FENETRES (Windows) - 6 images
  { path: 'public/images/services/fenetres/fenetres-1.jpg', url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/fenetres/fenetres-2.jpg', url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/fenetres/fenetres-3.jpg', url: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/fenetres/fenetres-4.jpg', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/fenetres/fenetres-5.jpg', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/fenetres/fenetres-6.jpg', url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop&q=80' },

  // MOBILIER (Furniture) - 6 images
  { path: 'public/images/services/mobilier/mobilier-1.jpg', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/mobilier/mobilier-2.jpg', url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/mobilier/mobilier-3.jpg', url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/mobilier/mobilier-4.jpg', url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/mobilier/mobilier-5.jpg', url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/mobilier/mobilier-6.jpg', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop&q=80' },

  // ESCALIERS (Stairs) - 6 images
  { path: 'public/images/services/escaliers/escaliers-1.jpg', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/escaliers/escaliers-2.jpg', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/escaliers/escaliers-3.jpg', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/escaliers/escaliers-4.jpg', url: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/escaliers/escaliers-5.jpg', url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/escaliers/escaliers-6.jpg', url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop&q=80' },

  // PLAFONDS (Ceilings) - 6 images
  { path: 'public/images/services/plafonds/plafonds-1.jpg', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/plafonds/plafonds-2.jpg', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/plafonds/plafonds-3.jpg', url: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/plafonds/plafonds-4.jpg', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/plafonds/plafonds-5.jpg', url: 'https://images.unsplash.com/photo-1600566752229-250ed79470f8?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/plafonds/plafonds-6.jpg', url: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop&q=80' },

  // RESTAURATION (Restoration) - 6 images
  { path: 'public/images/services/restauration/restauration-1.jpg', url: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/restauration/restauration-2.jpg', url: 'https://images.unsplash.com/photo-1540479859555-17af45c78602?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/restauration/restauration-3.jpg', url: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/restauration/restauration-4.jpg', url: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/restauration/restauration-5.jpg', url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/services/restauration/restauration-6.jpg', url: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&h=600&fit=crop&q=80' },
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
  console.log('🖼️  Downloading service gallery images (36 images)...\n');

  let success = 0;
  let failed = 0;

  for (const img of serviceImages) {
    try {
      await downloadWithRedirect(img.url, img.path);
      console.log(`✅ Downloaded: ${img.path}`);
      success++;
      // Rate limit to avoid being blocked
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.log(`❌ Failed: ${img.path} - ${e.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Completed: ${success} downloaded, ${failed} failed`);
}

main().catch(console.error);
