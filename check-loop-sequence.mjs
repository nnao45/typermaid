import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/home/nnao45/chrome/chrome/linux-142.0.7444.59/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024 });

    console.log('Navigating to demo page...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

    // Wait for React to render
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Click on Sequence tab
    console.log('Looking for Sequence tab...');
    const sequenceButton = await page.waitForSelector('text/Sequence', { timeout: 10000 });
    await sequenceButton.click();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Click on "Sequence with Loop" example
    console.log('Looking for Loop example...');
    const loopButton = await page.waitForSelector('text/Sequence with Loop', { timeout: 10000 });
    await loopButton.click();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Take screenshot of the diagram area
    console.log('Taking screenshot...');
    const diagramArea = await page.$('svg');
    if (diagramArea) {
      await diagramArea.screenshot({
        path: 'demo-screenshot-sequence-loop.png',
        type: 'png',
      });
      console.log('Screenshot saved to demo-screenshot-sequence-loop.png');
    } else {
      console.error('Could not find SVG element!');
      await page.screenshot({ path: 'demo-screenshot-sequence-loop-full.png' });
      console.log('Full page screenshot saved to demo-screenshot-sequence-loop-full.png');
    }

    // Also get the HTML to check structure
    const svgContent = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      return svg ? svg.outerHTML.substring(0, 2000) : 'No SVG found';
    });
    console.log('\nSVG structure (first 2000 chars):');
    console.log(svgContent);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
