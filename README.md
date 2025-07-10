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

## Report Ids Map
   ```javascript
   const reportNameToIdMap = {
       'Adjustent Detail': 'bdd_option:retailer-reports-activity-filters-report-name-0',
       'Confirmed Invoice Detail': 'bdd_option:retailer-reports-activity-filters-report-name-1',
       'Full Statement': 'bdd_option:retailer-reports-activity-filters-report-name-2',
       'Pack Activity History': 'bdd_option:retailer-reports-activity-filters-report-name-3',
       'Pack Inventory': 'bdd_option:retailer-reports-activity-filters-report-name-4',
       'Packs Activated': 'bdd_option:retailer-reports-activity-filters-report-name-5',
       'Packs Returned': 'bdd_option:retailer-reports-activity-filters-report-name-6',
       'Packs Settled': 'bdd_option:retailer-reports-activity-filters-report-name-7',
       'Primary Incentive Potential Entries': 'bdd_option:retailer-reports-activity-filters-report-name-8',
       'Reconciliation Overview': 'bdd_option:retailer-reports-activity-filters-report-name-9',
       'Retailer Average Weekly Sales': 'bdd_option:retailer-reports-activity-filters-report-name-10',
       'Retailer Packs Earned': 'bdd_option:retailer-reports-activity-filters-report-name-11',
       'Statement Summary': 'bdd_option:retailer-reports-activity-filters-report-name-12',
       'Validations - Mid-Tier Detail': 'bdd_option:retailer-reports-activity-filters-report-name-13',
       'Validations Summary': 'bdd_option:retailer-reports-activity-filters-report-name-14',
       'Draw Game Summary': 'bdd_option:retailer-reports-activity-filters-report-name-15',
       'Primary Incentive Payment History': 'bdd_option:retailer-reports-activity-filters-report-name-16',
       'Primary Incentive Potential Payment': 'bdd_option:retailer-reports-activity-filters-report-name-17',
       'Secondary Incentive Payment History': 'bdd_option:retailer-reports-activity-filters-report-name-18',
       'Secondary Incentive Potential Payment': 'bdd_option:retailer-reports-activity-filters-report-name-19',
       'Secondary Potential Entries': 'bdd_option:retailer-reports-activity-filters-report-name-20',
       'Status for Primary Incentive': 'bdd_option:retailer-reports-activity-filters-report-name-21',
       'Status for Secondary Incentive': 'bdd_option:retailer-reports-activity-filters-report-name-22',
       'Packs Returned - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-23',
       'Pack Inventory - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-24',
       'Full Statement - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-25',
       'Pack Activity History - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-26',
       'Adjustent Detail - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-27',
       'Packs Settled - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-28',
       'Validations - Mid-Tier Detail - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-29',
       'Confirmed Invoice Detail - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-30',
       'Packs Activated - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-31',
       'Draw Game Summary - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-32',
       'Retailer Packs Earned - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-33',
       'Validations Summary - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-34',
       'Statement Summary - WTD': 'bdd_option:retailer-reports-activity-filters-report-name-35',
   };
   ```

## Error Handling and Debugging

If any errors occur during execution, a screenshot will be saved in the `error` directory to help with debugging. The screenshot will be saved with a timestamped filename to ensure each error is recorded separately.
