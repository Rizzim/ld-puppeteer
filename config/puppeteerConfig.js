export const puppeteerOptions = {
    headless: true ,  // Mark headless as false for debugging (UI will be visible)
    args: [
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-gpu',
        '--no-sandbox',
        '--headless=old', // Also comment this when debugging
        '--disable-setuid-sandbox',
        '--window-size=1920,1080',
        '--no-startup-window', '--no-first-run'
    ],
    waitForInitialPage: false,
};

