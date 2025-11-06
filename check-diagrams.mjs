import puppeteer from 'puppeteer';

const diagramTypes = ['flowchart', 'sequence', 'class', 'state', 'er', 'gantt'];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/home/nnao45/chrome/chrome/linux-142.0.7444.59/chrome-linux64/chrome',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('🎀 Checking all diagram types...\n');

  for (const type of diagramTypes) {
    console.log(`📊 Checking ${type}...`);

    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get diagram info
    const info = await page.evaluate(() => {
      const svgs = document.querySelectorAll('svg');
      const errors = document.querySelectorAll('.error, [class*="error"]');

      return {
        svgCount: svgs.length,
        hasSvg: svgs.length > 0,
        hasErrors: errors.length > 0,
        errorTexts: Array.from(errors).map((e) => e.textContent?.substring(0, 100)),
      };
    });

    console.log(`  SVGs: ${info.svgCount}, Errors: ${info.hasErrors ? 'YES' : 'NO'}`);
    if (info.errorTexts.length > 0) {
      console.log(`  Error details:`, info.errorTexts);
    }

    // Take screenshot
    await page.screenshot({
      path: `demo-screenshot-${type}.png`,
      fullPage: true,
    });
    console.log(`  ✨ Screenshot: demo-screenshot-${type}.png\n`);
  }

  await browser.close();
  console.log('💕 All checks done!');
})();
