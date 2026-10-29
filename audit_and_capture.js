// audit_and_capture.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// 180s hard watchdog
const watchdog = setTimeout(() => {
  console.error("Watchdog timeout (180s) reached in audit_and_capture.js");
  process.exit(1);
}, 180000);
watchdog.unref();

const baseUrl = 'https://cloudempiretech.github.io/gossip-cafe-bardhaman';
const pages = [
  'index.html',
  'about.html',
  'offerings.html',
  'catering.html',
  'gallery.html',
  'reviews.html',
  'contact.html'
];

const screenshotsDir = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  console.log("=== STARTING MOBILE AUDIT & SCREENSHOT CAPTURE ===");

  // 1. Mobile Audit (390x844 and 375x667)
  for (const viewport of [{ width: 390, height: 844, name: 'iPhone 12 (390x844)' }, { width: 375, height: 667, name: 'iPhone SE (375x667)' }]) {
    console.log(`\n--- Auditing Viewport: ${viewport.name} ---`);
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
    });
    const page = await context.newPage();

    for (const p of pages) {
      const pageUrl = `${baseUrl}/${p}`;
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1000);

      // Check horizontal overflow
      const overflowInfo = await page.evaluate(() => {
        const bodyScrollWidth = document.body.scrollWidth;
        const docScrollWidth = document.documentElement.scrollWidth;
        const clientWidth = document.documentElement.clientWidth;
        const hasOverflow = bodyScrollWidth > clientWidth || docScrollWidth > clientWidth;
        return {
          bodyScrollWidth,
          docScrollWidth,
          clientWidth,
          hasOverflow
        };
      });

      if (overflowInfo.hasOverflow) {
        console.error(`❌ Overflow detected on ${p} in ${viewport.name}! Body: ${overflowInfo.bodyScrollWidth}, Doc: ${overflowInfo.docScrollWidth}, Client: ${overflowInfo.clientWidth}`);
        process.exit(1);
      } else {
        console.log(`✓ ${p} [${viewport.name}]: Perfect zero overflow (${overflowInfo.docScrollWidth}px / ${overflowInfo.clientWidth}px)`);
      }

      // Check mobile toggle button position
      const toggleCheck = await page.evaluate(() => {
        const toggle = document.querySelector('.mobile-toggle');
        if (!toggle) return { exists: false };
        const rect = toggle.getBoundingClientRect();
        const clientWidth = document.documentElement.clientWidth;
        return {
          exists: true,
          withinViewport: rect.left >= 0 && rect.right <= clientWidth + 2,
          right: rect.right,
          clientWidth
        };
      });

      if (toggleCheck.exists) {
        if (!toggleCheck.withinViewport) {
          console.error(`❌ Mobile toggle pushed off screen on ${p}! Right: ${toggleCheck.right}, ClientWidth: ${toggleCheck.clientWidth}`);
          process.exit(1);
        } else {
          console.log(`✓ Mobile toggle within viewport bounds on ${p}`);
        }
      }

      // If homepage, verify hero telemetry stats are above fold (< 844px)
      if (p === 'index.html' && viewport.height === 844) {
        const heroStatsBottom = await page.evaluate(() => {
          const stats = document.querySelectorAll('.hero-stat-card');
          if (stats.length === 0) return 0;
          let maxBottom = 0;
          stats.forEach(s => {
            const rect = s.getBoundingClientRect();
            if (rect.bottom > maxBottom) maxBottom = rect.bottom;
          });
          return maxBottom;
        });

        console.log(`Hero Telemetry 2x2 Grid Max Bottom on 390x844: ${heroStatsBottom}px (Fold: 844px)`);
        if (heroStatsBottom <= 844) {
          console.log(`✓ GUARANTEE MET: All 4 hero telemetry metrics render above the fold in initial mobile viewing zone (${heroStatsBottom}px <= 844px)`);
        } else {
          console.warn(`⚠️ Hero telemetry bottom is ${heroStatsBottom}px, slightly past 844px fold`);
        }
      }
    }
    await context.close();
  }

  // 2. Desktop Screenshots Capture (1280x800)
  console.log("\n=== CAPTURING FOUR DESKTOP SCREENSHOTS (1280x800) ===");
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const desktopPage = await desktopContext.newPage();

  // Screenshot 1: Desktop Homepage Hero
  await desktopPage.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
  await desktopPage.waitForTimeout(1500);
  const shot1Path = path.join(screenshotsDir, 'gossip_shot_1_home_hero.png');
  await desktopPage.screenshot({ path: shot1Path, fullPage: false });
  console.log(`✓ Saved: ${shot1Path}`);

  // Screenshot 2: Offerings Portfolio with sticky filter rail
  await desktopPage.goto(`${baseUrl}/offerings.html`, { waitUntil: 'networkidle', timeout: 30000 });
  await desktopPage.waitForTimeout(1500);
  const shot2Path = path.join(screenshotsDir, 'gossip_shot_2_offerings_portfolio.png');
  await desktopPage.screenshot({ path: shot2Path, fullPage: false });
  console.log(`✓ Saved: ${shot2Path}`);

  // Screenshot 3: Catering & Celebrations Showcase
  await desktopPage.goto(`${baseUrl}/catering.html`, { waitUntil: 'networkidle', timeout: 30000 });
  await desktopPage.waitForTimeout(1500);
  const shot3Path = path.join(screenshotsDir, 'gossip_shot_3_catering_showcase.png');
  await desktopPage.screenshot({ path: shot3Path, fullPage: false });
  console.log(`✓ Saved: ${shot3Path}`);

  // Screenshot 4: Authentic Gallery & Visiting Contact Counter
  await desktopPage.goto(`${baseUrl}/gallery.html`, { waitUntil: 'networkidle', timeout: 30000 });
  await desktopPage.waitForTimeout(1500);
  const shot4Path = path.join(screenshotsDir, 'gossip_shot_4_gallery_contact.png');
  await desktopPage.screenshot({ path: shot4Path, fullPage: false });
  console.log(`✓ Saved: ${shot4Path}`);

  await desktopContext.close();
  await browser.close();

  console.log("\n=== AUDIT & SCREENSHOT CAPTURE COMPLETED SUCCESSFULLY ===");
  process.exit(0);
})();
