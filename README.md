# Puppeteer Report Download Automation For Lotteries

This project automates the process of logging into the [Lottery Services website](https://tx-lsp.lotteryservices.com/lsptx/public/lotteryhome), selecting specific report options, downloading reports for each retailer, and saving the downloaded CSV files to a designated folder. The script is built using Node.js and Express, utilizing Puppeteer for browser automation. Screenshots are captured on errors to assist with debugging.

## Requirements

- [Node.js](https://nodejs.org/en/download/)
- Puppeteer

## Installation

1. Clone this repository or download the code.
2. Navigate to the project directory:
   ```bash
   cd Puppeteer-Sales-Automation
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

## Running the Script

To run the script, use the following command:

```bash
npm run start
```

To run in development environmnet:
```bash
npm run dev
```

## VPN Config
If you are not located in USA then use VPN to test it by choosing USA location.

## API Endpoint

To send a report request, use the following endpoint:
```bash
POST http://localhost:8020/api/puppeteer/send-report
```

### Request Body

The following JSON data needs to be passed in the request body:

```json
{
  "token": "<TOKEN_HERE>",
  "email": "<EMAIL to login to https://tx-lsp.lotteryservices.com/>",
  "password": "<PASSWORD to login to https://tx-lsp.lotteryservices.com/>",
  "reportIds": ["<IDS of report type will be passed as string>"]
}
```

## Debugging

If you encounter issues, you can enable a non-headless mode to visually observe the browser's actions. To do this:

1. Open the `config/puppeteerConfig.js` file.
2. Set `headless: false` in the Puppeteer `launch` options:
   ```javascript
   const browser = await puppeteer.launch({
       headless: false, // Set to false for debugging
       args: [
           '--disable-web-security',
           '--disable-features=IsolateOrigins,site-per-process',
           '--disable-gpu',
           '--no-sandbox',
           // '--headless=old', // Comment this line when debugging
           '--disable-setuid-sandbox',
           '--window-size=1920,1080',
           '--no-startup-window', '--no-first-run'
       ],
       waitForInitialPage: false,
   });
   ```

This will open the browser in a visible mode, so you can observe what is happening. Additionally, you should comment out the `--headless=old` line when debugging, as shown above.

## Error Handling and Debugging

If any errors occur during execution, a screenshot will be saved in the `error` directory to help with debugging. The screenshot will be saved with a timestamped filename to ensure each error is recorded separately.
