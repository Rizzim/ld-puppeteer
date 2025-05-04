import { launch } from 'puppeteer';
import { existsSync, mkdirSync } from 'fs';
import { resolve as _resolve, join } from 'path';
// require('dotenv').config();

// const { retailerOptions } = require('./constants.js');

// Utility function to format date as mm/dd/yyyy
const formatDateAsMMDDYYYY = (date) => {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${month}/${day}/${year}`; // Returns date as mm/dd/yyyy
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main function that logs in and downloads reports for each retailer marked as IMP
async function downloadReportsForRetailers() {
    // const downloadPath = _resolve(__dirname, 'data');
    // const errorPath = _resolve(__dirname, 'error');

    // // Check if the directories exist, create them if they don't
    // if (!existsSync(downloadPath)) {
    //     mkdirSync(downloadPath, { recursive: true });
    //     console.log(`Created directory: ${downloadPath}`);
    // }
    
    // if (!existsSync(errorPath)) {
    //     mkdirSync(errorPath, { recursive: true });
    //     console.log(`Created directory: ${errorPath}`);
    // }

    const browser = await launch({ 
        headless: false ,  // Mark headless as false for debugging (UI will be visible)
        args: [
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-gpu',
            '--no-sandbox',
            // '--headless=old', // Also comment this when debugging
            '--disable-setuid-sandbox',
            '--window-size=1920,1080',
            '--no-startup-window', '--no-first-run'
        ],
        waitForInitialPage: false,
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    try {
        // Configure download behavior to save files to your custom folder
        const client = await page.createCDPSession();
        // await client.send('Page.setDownloadBehavior', {
        //     behavior: 'allow',
        //     downloadPath: downloadPath, // Set the download folder path
        // });

        // Step 1: Go to the login page and log in
        await page.goto('https://txs.lotteryservices.com/RetailerWizard/#/home');
        await page.waitForSelector('input[name="loginEmail"]');
        await page.type('input[name="loginEmail"]', 'Rnali85@gmail.com');

        // Step 2: Type the password and submit
        await page.waitForSelector('input[name="passwdRetailer"]');
        await page.type('input[name="passwdRetailer"]', 'Aaron@52416');
        await page.click('rw-button.login__button'); // Submit the password

        // Wait for navigation after login
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await wait(2000);

        // Step 3: Navigate to the reports page
        await page.goto('https://txs.lotteryservices.com/RetailerWizard/#/reports');
        await wait(3000);

        // Step 4: Select report type
        await page.click('md-select#raportName');
        await page.waitForSelector('.md-select-menu-container', { visible: true });

        // Select the option "Packs Activated"
        const valueToSelect = 'Packs Activated';
        await page.evaluate((value) => {
          const option = [...document.querySelectorAll('md-option')].find(
            (el) => el.getAttribute('value') === value
          );
          if (option) option.click();
        }, valueToSelect);
      
        // Wait for the selection to update
        await page.waitForTimeout(500); // Optional: Add a delay for UI updates
      
        // Verify the selected value
        const selectedValue = await page.evaluate(() => {
          const valueElement = document.querySelector('md-select > .md-select-value');
          return valueElement ? valueElement.textContent.trim() : null;
        });
      
        if (selectedValue === 'Packs Activated') {
          console.log('Successfully selected:', selectedValue);
        } else {
          console.error('Failed to select "Packs Activated". Current value:', selectedValue);
        }

        // // Verify the selection (optional)
        // const selectedValue = await page.evaluate(() => {
        //     const dropdown = document.querySelector('md-select#reportName');
        //     return dropdown ? dropdown.getAttribute('aria-label') : null;
        // });

        console.log('Selected Value:', selectedValue);
      
        // Confirm the selection (optional debugging step)
        // const selectedValue = await page.evaluate(() => {
        //   const dropdown = document.querySelector('md-select#reportName');
        //   return dropdown ? dropdown.getAttribute('aria-label') : null;
        // });
        // console.log('Selected Value:', selectedValue);
        // Select all options and retrieve them in the required format
        // const retailerOptions = await page.evaluate(() => {
        // const options = Array.from(document.querySelectorAll('#retailerId option:not(:first-child)'));
        // return options.map(option => ({
        //     id: option.value,
        //     name: option.textContent.match(/Retailer Name:\s(.*?)-/)[1].trim() // Extract retailer name
        //     }));
        // });

        // // Get the count of options
        // const optionCount = retailerOptions.length;
        // console.log('Total options:', optionCount);
        // console.log('Retailer Options:', retailerOptions);

        // // Step 4: Iterate through retailers
        // for (const retailer of retailerOptions) {
        //     console.log(`Processing retailer: ${retailer.name}`);

        //     // Step 5: Select retailer ID
        //     await page.waitForSelector('#retailerId');
        //     await page.select('#retailerId', retailer.id);

        //     // Step 6: Set date fields (yesterday as start, today as end)
        //     const yesterday = new Date();
        //     yesterday.setDate(yesterday.getDate() - 1);
        //     const yesterdayStr = formatDateAsMMDDYYYY(yesterday);
        //     const todayStr = formatDateAsMMDDYYYY(new Date());

        //     await page.waitForSelector('#startInvoiceDate');
        //     await page.evaluate((date) => {
        //         document.querySelector('#startInvoiceDate').value = date;
        //     }, yesterdayStr);

        //     await page.waitForSelector('#endInvoiceDate');
        //     await page.evaluate((date) => {
        //         document.querySelector('#endInvoiceDate').value = date;
        //     }, todayStr);

        //     // Step 7: Select report settings
        //     await page.waitForSelector('#subCategoryCd');
        //     await page.select('#subCategoryCd', '-1'); // Select "-1" for subCategoryCd

        //     // Step 8: Select the report type
        //     await wait(3000);
        //     await page.waitForSelector('#reportName');
        //     await page.select('#reportName', '2'); // Select report type "2"

        //     // Step 9: Click on the CSV button to trigger the download
        //     await wait(5000);
        //     await page.waitForSelector('#csv');
        //     await page.click('#csv');

        //     // Wait for the download to complete
        //     await wait(10000); // Adjust timing as needed

        //     // Log successful download
        //     console.log(`Downloaded report for retailer: ${retailer.name}`);

        //     // ***** Call API to upload the report with csv file, retailerID  ******
        //     // TODO: Implement API call to upload the report
        // }
    } catch (error) {
        console.error('Error while processing retailers:', error);

        //  // Capture screenshot on error with a timestamp
        //  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        //  const screenshotPath = join(errorPath, `error_${timestamp}.png`);
         
        //  await page.screenshot({ path: screenshotPath, fullPage: true });
        //  console.log(`Screenshot saved: ${screenshotPath}`);
    } finally {
        // Close browser after all operations
        // await browser.close();
    }
}

// Start the script
downloadReportsForRetailers();