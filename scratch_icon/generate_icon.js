const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage();

  // Set the viewport to exactly 1024x1024 to match the icon size
  await page.setViewport({ width: 1024, height: 1024 });

  // HTML content for the icon
  // We use the exact SVG provided, but with rx and ry set to 0 for a square icon (since Expo handles corner rounding),
  // and load the Bungee font from Google Fonts.
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Bungee&display=swap" rel="stylesheet">
        <style>
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: transparent;
          }
        </style>
      </head>
      <body>
        <svg
          viewBox="0 0 1024 1024"
          width="1024"
          height="1024"
          xmlns="http://www.w3.org/2000/svg"
          style="display: block"
        >
          <rect width="1024" height="1024" fill="#6B21A8" />
          <text
            x="512"
            y="570"
            text-anchor="middle"
            dominant-baseline="middle"
            font-family="'Bungee', sans-serif"
            font-weight="400"
            font-size="192"
            letter-spacing="-4"
            fill="#FFFFFF"
          >
            SYNTRA.
          </text>
        </svg>
      </body>
    </html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Wait an extra second to ensure the web font is fully applied
  await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));

  // Take the screenshot
  await page.screenshot({ path: '../frontend/assets/icon.png', omitBackground: true });
  
  console.log('Successfully generated icon.png!');

  await browser.close();
})();
