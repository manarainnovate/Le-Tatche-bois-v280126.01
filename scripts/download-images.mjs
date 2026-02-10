import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const images = [
  // Hero slides - woodworking/workshop themes
  { path: 'public/images/hero/slide-1.jpg', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop&q=80' },
  { path: 'public/images/hero/slide-2.jpg', url: 'https://images.unsplash.com/photo-1616464916356-3a777b2b60b1?w=1920&h=1080&fit=crop&q=80' },
  { path: 'public/images/hero/slide-3.jpg', url: 'https://images.unsplash.com/photo-1597348989645-e6eb10bb5fc9?w=1920&h=1080&fit=crop&q=80' },

  // About section - workshop and craftsman
  { path: 'public/images/about/workshop.jpg', url: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/about/founder.jpg', url: 'https://images.unsplash.com/photo-1540479859555-17af45c78602?w=400&h=500&fit=crop&q=80' },
  { path: 'public/images/about/workshop-hero.jpg', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&h=800&fit=crop&q=80' },
  { path: 'public/images/about/cta-bg.jpg', url: 'https://images.unsplash.com/photo-1610505466122-b0c0f66b3876?w=1200&h=600&fit=crop&q=80' },

  // Projects
  { path: 'public/images/projects/project-1.jpg', url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/projects/project-2.jpg', url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/projects/project-3.jpg', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/projects/project-4.jpg', url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/projects/project-5.jpg', url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/projects/project-6.jpg', url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&h=600&fit=crop&q=80' },

  // Products - furniture
  { path: 'public/images/products/product-1.jpg', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop&q=80' },
  { path: 'public/images/products/product-2.jpg', url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&h=600&fit=crop&q=80' },
  { path: 'public/images/products/product-3.jpg', url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&h=600&fit=crop&q=80' },
  { path: 'public/images/products/product-4.jpg', url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&h=600&fit=crop&q=80' },
  { path: 'public/images/products/product-5.jpg', url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&h=600&fit=crop&q=80' },
  { path: 'public/images/products/product-6.jpg', url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&h=600&fit=crop&q=80' },

  // Testimonials - people portraits
  { path: 'public/images/testimonials/client-1.jpg', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80' },
  { path: 'public/images/testimonials/client-2.jpg', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80' },
  { path: 'public/images/testimonials/client-3.jpg', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80' },
  { path: 'public/images/testimonials/client-4.jpg', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&q=80' },

  // Team images
  { path: 'public/images/team/founder.jpg', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&q=80' },
  { path: 'public/images/team/chef.jpg', url: 'https://images.unsplash.com/photo-1540479859555-17af45c78602?w=400&h=500&fit=crop&q=80' },
  { path: 'public/images/team/designer.jpg', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=500&fit=crop&q=80' },
  { path: 'public/images/team/artisan.jpg', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=500&fit=crop&q=80' },

  // Workshop gallery
  { path: 'public/images/workshop/workshop-1.jpg', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/workshop/workshop-2.jpg', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/workshop/workshop-3.jpg', url: 'https://images.unsplash.com/photo-1610505466122-b0c0f66b3876?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/workshop/workshop-4.jpg', url: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/workshop/workshop-5.jpg', url: 'https://images.unsplash.com/photo-1597348989645-e6eb10bb5fc9?w=800&h=600&fit=crop&q=80' },
  { path: 'public/images/workshop/workshop-6.jpg', url: 'https://images.unsplash.com/photo-1616464916356-3a777b2b60b1?w=800&h=600&fit=crop&q=80' },

  // CTA background
  { path: 'public/images/cta/workshop-bg.jpg', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=800&fit=crop&q=80' },
];

function downloadWithRedirect(url, filepath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(path.join(__dirname, '..', filepath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const fullPath = path.join(__dirname, '..', filepath);
    const file = fs.createWriteStream(fullPath);

    function followRedirect(currentUrl) {
      https.get(currentUrl, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
          // Follow redirect
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
  console.log('Downloading images from Unsplash...\n');

  let success = 0;
  let failed = 0;

  for (const img of images) {
    try {
      await downloadWithRedirect(img.url, img.path);
      console.log(`Downloaded: ${img.path}`);
      success++;
    } catch (e) {
      console.log(`Failed: ${img.path} - ${e.message}`);
      failed++;
    }
  }

  console.log(`\nCompleted: ${success} downloaded, ${failed} failed`);
}

main().catch(console.error);
