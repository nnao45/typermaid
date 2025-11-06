import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/home/nnao45/chrome/chrome/linux-142.0.7444.59/chrome-linux64/chrome',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('🎀 Navigating to demo app...');
  await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait for React to render
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Take screenshot
  await page.screenshot({ path: 'demo-screenshot.png', fullPage: true });
  console.log('✨ Screenshot saved to demo-screenshot.png');

  // Get page title
  const title = await page.title();
  console.log('📝 Page title:', title);

  // Get rendered content
  const content = await page.evaluate(() => {
    const root = document.getElementById('root');
    return {
      hasRoot: !!root,
      rootHTML: root?.innerHTML?.substring(0, 1000),
      hasErrors: document.querySelector('.error') !== null,
      diagramCount: document.querySelectorAll('svg').length,
    };
  });

  console.log('🎨 Content check:', JSON.stringify(content, null, 2));

  // Get console messages
  const consoleLogs = [];
  page.on('console', (msg) => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
  });

  await browser.close();

  console.log('💕 Done!');
})();
