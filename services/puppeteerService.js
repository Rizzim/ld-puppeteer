import { launch } from 'puppeteer';
import { existsSync, mkdirSync, createReadStream, lstatSync } from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { puppeteerOptions } from '../config/puppeteerConfig.js';
import formatDate from '../utils/formatDate.js';
import wait from '../utils/wait.js';
import constants from '../utils/reportsConstants.js';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
    
const __dirname = dirname(fileURLToPath(import.meta.url));

const { reportNameToIdMap } = constants;

async function downloadReports(email, password, token, reportIds) {
    const downloadPath = resolve(__dirname, '../data');
    const errorPath = resolve(__dirname, '../error');

    // Check if the directories exist, create them if they don't
    if (!existsSync(downloadPath)) {
        mkdirSync(downloadPath, { recursive: true });
        console.log(`Created directory: ${downloadPath}`);
    }
    
    if (!existsSync(errorPath)) {
        mkdirSync(errorPath, { recursive: true });
        console.log(`Created directory: ${errorPath}`);
    }
    
    const browser = await launch(puppeteerOptions);
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    try {
        // Configure download behavior to save files to your custom folder
        const client = await page.createCDPSession();
        await client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: downloadPath, // Set the download folder path
        });

        // Step 1: Go to the login page and log in
        await page.goto('https://txs.lotteryservices.com/RetailerWizard/#/home');

        await page.waitForSelector('input[name="loginEmail"]');
        await page.type('input[name="loginEmail"]', email);
        
        await page.waitForSelector('input[name="passwdRetailer"]');
        await page.type('input[name="passwdRetailer"]', password);
        
        // Option 1: Click based on the text content within the <translate> tag
        await page.waitForSelector('button ng-transclude translate');
        const buttonsWithLoginText = await page.$$('button ng-transclude translate');

        for (const button of buttonsWithLoginText) {
            const textContent = await button.evaluate(el => el.textContent.trim());
            if (textContent === 'Log In') {
                await button.click();
                console.log('Clicked the "Log In" button based on text.');
                break
            }
        }

        // Wait for navigation if login redirects
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        await page.waitForSelector('a span');
        const reportLinks = await page.$$('a span');
    
        for (const link of reportLinks) {
          const textContent = await link.evaluate(el => el.textContent.trim());
          if (textContent === 'Reports') {
            // Find the parent 'a' tag and click it
            const parentAnchor = await link.evaluateHandle(el => el.parentElement);
            await parentAnchor.click();
            console.log('Clicked the "Reports" link based on text.');
            break; // Assuming there's only one "Reports" link you want to click
          }
        }

const targetDropdownId = 'raportName';
const dropdownSelector = `#${targetDropdownId}`;
const desiredOptionId = 'bdd_option:retailer-reports-activity-filters-report-name-3'; // Replace with your dynamic or mapped ID

// Step 1: Click the <md-select> to open dropdown
await page.waitForSelector(dropdownSelector);
await page.click(dropdownSelector);
console.log(`Opened dropdown with ID "${targetDropdownId}"`);

// Step 2: Wait for <md-option> elements to appear
await page.waitForSelector('md-option'); // Waits for Angular options
await wait(20); // Optional: extra time to let it render

// Step 3: Find and click the correct option by ID
const options = await page.$$('md-option');
let found = false;

for (const option of options) {
  const id = await option.evaluate(el => el.id);
  if (id === desiredOptionId) {
    await option.click();
    console.log(`Selected option with ID: "${id}"`);
    found = true;
    break;
  }
}

if (!found) {
  console.error(`Could not find <md-option> with ID "${desiredOptionId}" in the dropdown.`);
}


        // add wait delkay of 2 min
        await wait(200);

      // Step 6: Set date fields (yesterday as start, today as end)
  const todayStr = formatDate(new Date());
  const yesterdayStr = formatDate(new Date(Date.now() - 86400000)); // 1 day ago

  // Set date fields
  await page.evaluate((startDate, endDate) => {
    document.querySelector('#from-date').value = startDate; // Use the correct ID: from-date
    document.querySelector('#to-date').value = endDate;     // Use the correct ID: to-date
  }, yesterdayStr, todayStr);

  await wait(2000);

  console.log('Starting tab navigation to reach search button...');
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      // Small delay between tabs to ensure focus changes
      await wait(200);
      console.log(`Pressed Tab (${i+1}/4)`);
    }
    
    // Press Enter to activate the search button
    await page.keyboard.press('Enter');
    console.log('Pressed Enter to trigger search');
    
    // Wait for the search results to load
    await wait(3000);
    console.log('Search completed');
    

// Small pause if needed
await wait(2000);
return;


        // Step 4: Iterate through retailers marked as IMP

        // // First select all options and retrieve them in the required format
        // const retailerOptions = await page.evaluate(() => {
        // const options = Array.from(document.querySelectorAll('#retailerId option:not(:first-child)'));
        // return options.map(option => ({
        //     id: option.value,
        //     name: option.textContent.match(/Retailer Name:\s(.*?)-/)[1].trim() // Extract retailer name
        //     }));
        // });

        // Get the count of options
        const optionCount = retailerOptions.length;
        console.log('Total options:', optionCount);
        console.log('Retailer Options:', retailerOptions);

        const selectedReports = reportOptions.filter(report => reportIds.includes(report.id));
        console.log('Selected Reports:', selectedReports);

        // Iterate through retailers
        for (const retailer of retailerOptions) {
            console.log(`Processing retailer: ${retailer.name}`);

            // Step 5: Select retailer ID
            await page.waitForSelector('#retailerId');
            await page.select('#retailerId', retailer.id);

            // Step 6: Set date fields (yesterday as start, today as end)
            const todayStr = formatDate(new Date());
            const yesterdayStr = formatDate(new Date(Date.now() - 86400000)); // 1 day ago

            // Set date fields
            await page.evaluate((startDate, endDate) => {
                document.querySelector('#startInvoiceDate').value = startDate;
                document.querySelector('#endInvoiceDate').value = endDate;
            }, yesterdayStr, todayStr);

            // Step 7: Select report settings
            await page.waitForSelector('#subCategoryCd');
            await page.select('#subCategoryCd', '-1'); // Select "-1" for subCategoryCd

            // Step 8: Select the report type
            for (const reportType of selectedReports) {
                await wait(3000);
                await page.waitForSelector('#reportName');
                await page.select('#reportName', reportType.id);
                
                // Check if CSV option is supported
                await wait(5000);
                const isCsvSupported = await page.evaluate(() => {
                    const el = document.getElementById('csv');
                    console.log(`Element: ${el}`);
                    console.log(`Title: ${el?.getAttribute('title')}`);
                    if (el && !el.getAttribute('title')?.includes("CSV option was not supported")) {
                        return true;
                    }
                    return false;
                }); 
                if (!isCsvSupported) {
                    console.log(`CSV option is not supported for report: ${reportType.name}, skipping to next report.`);
                    continue;
                }
                
                // Step 9: Click on the CSV button to trigger the download
                await page.waitForSelector('#csv');
                await page.click('#csv');
    
                await wait(10000); // Adjust timing as needed

                // Log successful download
                console.log(`Downloaded report for retailer: ${retailer.name}`);
    
                // ***** Call API to upload the report with csv file, retailerID  ******
                const reportName = `${new Date().toISOString().replace(/[:.]/g, '-')}_${retailer.name}_${reportType.name.toUpperCase().replace(/ /g, '')}.csv`;
                console.log(`Report name: ${reportName}`);
                const filePath = join(downloadPath, `${reportType.name.toUpperCase().replace(/ /g, "")}.csv`);
                console.log(`File path: ${filePath}`);
                await uploadReportToAPI(filePath, reportName, token);
            }
        }
    } catch (error) {
        console.error('Error while processing retailers:', error);

        // Capture screenshot on error with a timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotPath = join(errorPath, `error_${timestamp}.png`);
        
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Screenshot saved: ${screenshotPath}`);
    } finally {
        console.log('All done, closing browser');
        await browser.close();
    }
}


async function uploadReportToAPI(filePath, reportName, token) {
    console.log(`Uploading report: ${reportName}`);
    console.log(`File path: ${filePath}`);
    if (!existsSync(filePath) || !lstatSync(filePath).isFile()) {
        console.error('File not found or incorrect path:', filePath);
        return;
    }

    const form = new FormData();
    form.append('file', createReadStream(filePath));
    form.append('name', reportName);

    try {
        const response = await axios.post('https://stage.lotteryscreen.app/api/puppeteer', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log(response.data);
        if (response.status === 200) {
            console.log(`Report ${reportName} uploaded successfully`);
        } else {
            console.log(`Failed to upload report ${reportName}:`, response.statusText);
        }
    } catch (error) {
        console.error(`Error uploading report ${reportName}:`, error.message);
    }
}

export default downloadReports;
