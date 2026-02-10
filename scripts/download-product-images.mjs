import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const productImages = [
  // Moroccan woodworking products - quality furniture/decor images
  { path: 'public/images/products/product-1.jpg', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop&q=80' },
  { path: 'public/images/products/product-2.jpg', url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&h=600&fit=crop&q=80' },
  { path: 'public/images/products/product-3.jpg', url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&h=600&fit=crop&q=80' },
  { path: 'public/images/products/product-4.jpg', url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&h=600&fit=crop&q=80' },
  { path: 'public/images/products/product-5.jpg', url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&h=600&fit=crop&q=80' },
  { path: 'public/images/products/product-6.jpg', url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&h=600&fit=crop&q=80' },
  { path: 'public/images/products/product-7.jpg', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=600&fit=crop&q=80' },
  { path: 'public/images/products/product-8.jpg', url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&h=600&fit=crop&q=80' },
  { path: 'public/images/products/product-9.jpg', url: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=600&h=600&fit=crop&q=80' },
  { path: 'public/images/products/product-10.jpg', url: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=600&h=600&fit=crop&q=80' },
  { path: 'public/images/products/product-11.jpg', url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=600&fit=crop&q=80' },
  { path: 'public/images/products/product-12.jpg', url: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&h=600&fit=crop&q=80' },
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
  console.log('📦 Downloading product images from Unsplash...\n');

  let success = 0;
  let failed = 0;

  for (const img of productImages) {
    try {
      await downloadWithRedirect(img.url, img.path);
      console.log(`✅ Downloaded: ${img.path}`);
      success++;
      // Rate limit to avoid being blocked
      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      console.log(`❌ Failed: ${img.path} - ${e.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Completed: ${success} downloaded, ${failed} failed`);
}

main().catch(console.error);
