import { launch } from "puppeteer";
import {
  existsSync,
  mkdirSync,
  createReadStream,
  lstatSync,
  unlinkSync,
  readdirSync,
} from "fs";
import { resolve, dirname, join } from "path";
import axios from "axios";
import FormData from "form-data";
import { fileURLToPath } from "url";

import { puppeteerOptions } from "../config/puppeteerConfig.js";
import formatDate from "../utils/formatDate.js";
import wait from "../utils/wait.js";
import constants from "../utils/reportsConstants.js";
import { tmpdir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { reportNameToIdMap, reportIdToNameMap } = constants;

async function downloadReports(email, password, reportIds) {
  // Use /tmp as the base writable directory
  // const baseTempDir = tmpdir();
  // const downloadPath = join(baseTempDir, "data");
  // const errorPath = join(baseTempDir, "error");

  const downloadPath = resolve(__dirname, "../data");
  const errorPath = resolve(__dirname, "../error");

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
  page.setDefaultNavigationTimeout(60000); // 60 seconds
  page.setDefaultTimeout(60000); // Applies to all waits
  page.setViewport({ width: 1280, height: 720 });

  try {
    // Configure download behavior to save files to your custom folder
    const client = await page.createCDPSession();
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: downloadPath, // Set the download folder path
    });

    // Step 1: Go to the login page and log in
    await page.goto("https://txs.lotteryservices.com/RetailerWizard/#/home");

    await page.waitForSelector('input[name="loginEmail"]');
    await page.type('input[name="loginEmail"]', email);

    await page.waitForSelector('input[name="passwdRetailer"]');
    await page.type('input[name="passwdRetailer"]', password);

    // Option 1: Click based on the text content within the <translate> tag
    await page.waitForSelector("button ng-transclude translate");
    const buttonsWithLoginText = await page.$$(
      "button ng-transclude translate"
    );

    for (const button of buttonsWithLoginText) {
      const textContent = await button.evaluate((el) => el.textContent.trim());
      if (textContent === "Log In") {
        await button.click();
        console.log('Clicked the "Log In" button based on text.');
        break;
      }
    }

    // Wait for navigation if login redirects
    await page.waitForNavigation({ waitUntil: "networkidle0" });

    await page.waitForSelector("a span");
    const reportLinks = await page.$$("a span");

    for (const link of reportLinks) {
      const textContent = await link.evaluate((el) => el.textContent.trim());
      if (textContent === "Reports") {
        // Find the parent 'a' tag and click it
        const parentAnchor = await link.evaluateHandle(
          (el) => el.parentElement
        );
        await parentAnchor.click();
        console.log('Clicked the "Reports" link based on text.');
        break; // Assuming there's only one "Reports" link you want to click
      }
    }

    for (const reportId of reportIds) {
      const desiredOptionId = reportId; // Get the dynamic ID from map
      const desiredOptionName = reportIdToNameMap[reportId]; // Get the dynamic name from map
      const dropdownSelector = "#raportName";

      // Open dropdown
      await page.waitForSelector(dropdownSelector);
      await page.click(dropdownSelector);
      console.log(`Opened dropdown for: ${desiredOptionName}`);

      // Wait for md-option elements to load
      await page.waitForSelector("md-option");
      await wait(200);

      // Select the desired report by ID
      const options = await page.$$("md-option");
      let found = false;
      for (const option of options) {
        const id = await option.evaluate((el) => el.id);
        if (id === desiredOptionId) {
          await option.click();
          console.log(`Selected: ${desiredOptionName} (ID: ${id})`);
          found = true;
          break;
        }
      }

      if (!found) {
        console.error(`❌ Could not find option ID for ${desiredOptionName}`);
        continue; // Skip to next reportId
      }

      // Set date fields [This adds current date and yesterday]
      // const todayStr = formatDate(new Date());
      // const yesterdayStr = formatDate(new Date(Date.now() - 86400000));
      // await page.evaluate((startDate, endDate) => {
      //   document.querySelector('#from-date').value = startDate;
      //   document.querySelector('#to-date').value = endDate;
      // }, yesterdayStr, todayStr);
      // await wait(2000);

      const dateStr = formatDate(new Date(Date.now() - 86400000));

      await page.evaluate((date) => {
        document.querySelector("#from-date").value = date;
        document.querySelector("#to-date").value = date;
      }, dateStr);

      await wait(2000);

      // Tab to search button and press Enter
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press("Tab");
        await wait(200);
      }
      await page.keyboard.press("Enter");
      console.log("🔍 Triggered search");
      await wait(3000);

      // Click and download CSV
      const result = await clickFirstReportAndDownloadCsv(page);
      if (result.success) {
        console.log(`✅ CSV downloaded for ${desiredOptionName}`);
      } else {
        console.error(`❌ Failed to download CSV for ${desiredOptionName}`);
        continue;
      }

      // Upload downloaded report

      // Prepare report name and find downloaded file
      const reportKeyword = desiredOptionName.replace(/ /g, "_"); // e.g., "Packs_Activated"
      const yesterday = new Date(Date.now() - 86400000);
      const formattedDate = `${
        yesterday.getMonth() + 1
      }-${yesterday.getDate()}-${yesterday.getFullYear()}`;

      // Search for the matching file
      const files = readdirSync(downloadPath);
      const matchedFile = files.find((file) =>
        file.match(
          new RegExp(`.*_${reportKeyword}_${formattedDate}\\.csv$`, "i")
        )
      );

      if (!matchedFile) {
        throw new Error(
          `Downloaded file for ${reportKeyword} on ${formattedDate} not found.`
        );
      }

      const filePath = join(downloadPath, matchedFile);

      // Generate clean report name
      const reportName = `${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}_${email}_${desiredOptionName
        .toUpperCase()
        .replace(/ /g, "")}.csv`;

      console.log(`Uploading ${filePath} as ${reportName}`);
      await uploadReportToAPI(filePath, reportName);

      // After upload, delete the file
      if (existsSync(filePath)) {
        unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
      }

      await wait(2000); // Optional pause
    }
  } catch (error) {
    console.error("Error while processing:", error);

    // Capture screenshot on error with a timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const screenshotPath = join(errorPath, `error_${timestamp}.png`);

    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved: ${screenshotPath}`);

    throw error;
  } finally {
    console.log("All done, closing browser");
    await browser.close();
    // process.exit(0); // This stops the running script
  }
}

async function clickFirstReportAndDownloadCsv(page) {
  try {
    console.log("Waiting for table to load...");

    // Wait for table to fully load
    await page.waitForSelector("table.md-table tbody tr", {
      timeout: 15000,
      visible: true,
    });

    // Get information about the first report
    const firstReportInfo = await page.evaluate(() => {
      // Get the first row
      const firstRow = document.querySelector("table.md-table tbody tr");
      if (!firstRow) return null;

      // Get the report name
      const reportNameElement = firstRow.querySelector("dropdown-toggle a");
      const reportName = reportNameElement
        ? reportNameElement.textContent.trim()
        : "Unknown";

      return { reportName };
    });

    if (!firstReportInfo) {
      console.error("Could not find any reports in the table");
      return { success: false, reportName: null };
    }

    console.log(`Found first report: ${firstReportInfo.reportName}`);

    // Click on the first report's dropdown toggle
    console.log("Clicking on the first report dropdown...");

    const clicked = await page.evaluate(() => {
      const firstReportToggle = document.querySelector(
        "table.md-table tbody tr td .dropdown-toggle"
      );
      if (firstReportToggle) {
        firstReportToggle.click();
        return true;
      }
      return false;
    });

    if (!clicked) {
      console.error("Failed to click on report dropdown");
      return { success: false, reportName: firstReportInfo.reportName };
    }

    // Wait for dropdown menu to appear
    console.log("Waiting for dropdown menu to appear...");
    await wait(1000);

    // Make sure dropdown is visible
    await page.evaluate(() => {
      const dropdownMenu = document.querySelector(".dropdown-menu");
      if (dropdownMenu && dropdownMenu.style.display === "none") {
        dropdownMenu.style.display = "block";
      }
    });

    // Find and click the CSV option
    console.log("Looking for CSV option...");

    const csvClicked = await page.evaluate(() => {
      // Find all label-details
      const labelDetails = Array.from(
        document.querySelectorAll("label-details")
      );
      // Find the one containing "csv"
      const csvLabel = labelDetails.find(
        (label) => label.textContent.trim().toLowerCase() === "csv"
      );

      if (csvLabel) {
        // Navigate up to find the clickable anchor
        const link = csvLabel.closest("a");
        if (link) {
          link.click();
          return true;
        }
      }

      // Try alternative approach
      const dropdownItems = Array.from(
        document.querySelectorAll(".dropdown-item")
      );
      for (const item of dropdownItems) {
        if (item.textContent.trim().toLowerCase().includes("csv")) {
          const link = item.querySelector("a");
          if (link) {
            link.click();
            return true;
          }
        }
      }

      return false;
    });

    if (!csvClicked) {
      console.error("Failed to click CSV option");
      return { success: false, reportName: firstReportInfo.reportName };
    }

    console.log("Successfully clicked CSV option");

    // Wait for download to start
    await wait(3000);

    return {
      success: true,
      reportName: firstReportInfo.reportName,
    };
  } catch (error) {
    console.error("Error clicking first report:", error);
    return { success: false, reportName: null };
  }
}

async function uploadReportToAPI(filePath, reportName) {
  console.log(`Uploading report: ${reportName}`);
  console.log(`File path: ${filePath}`);

  if (!existsSync(filePath) || !lstatSync(filePath).isFile()) {
    console.error("File not found or incorrect path:", filePath);
    return;
  }

  const form = new FormData();
  form.append("file", createReadStream(filePath));
  form.append("name", reportName);

  try {
    const response = await axios.post(
      "https://stage.lotteryscreen.app/api/puppeteer",
      form,
      {
        headers: {
          ...form.getHeaders(),
          // Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log(response.data);
    if (response.status === 200) {
      console.log(`Report ${reportName} uploaded successfully`);
    } else {
      console.log(
        `Failed to upload report ${reportName}:`,
        response.statusText
      );
    }
  } catch (error) {
    console.error(`Error uploading report ${reportName}:`, error.message);
  }
}

export default downloadReports;
