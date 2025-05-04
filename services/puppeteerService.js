import { launch } from "puppeteer";
import { createDirectoryIfNotExists, findFileByPattern, deleteFileIfExists } from "./utils/fileUtils.js";
import wait from "./utils/wait.js";
import { captureScreenshotOnError } from "./utils/screenshotUtils.js";
import { formatDate, getYesterdayDate } from "./utils/dateUtils.js";
import axios from "axios";
import FormData from "form-data";

import { puppeteerOptions } from "../config/puppeteerConfig.js";
import constants from "../constants/reportsConstants.js";

const { reportNameToIdMap, reportIdToNameMap } = constants;

async function downloadReports(email, password, token, reportIds) {
  const downloadPath = resolve(__dirname, "../data");
  const errorPath = resolve(__dirname, "../error");

  // Create directories if they don't exist
  createDirectoryIfNotExists(downloadPath);
  createDirectoryIfNotExists(errorPath);

  const browser = await launch(puppeteerOptions);
  const page = await browser.newPage();

  try {
    await login(page, email, password);
    await navigateToReports(page);

    for (const reportId of reportIds) {
      const reportName = reportIdToNameMap[reportId];
      const reportFileName = await downloadReport(page, reportId, reportName, downloadPath);
      
      // Handle file upload
      const matchedFile = findFileByPattern(downloadPath, new RegExp(`.*_${reportFileName}_.*\\.csv$`, "i"));
      if (!matchedFile) throw new Error(`Downloaded file for ${reportFileName} not found.`);
      
      const filePath = join(downloadPath, matchedFile);
      const reportNameWithDate = `${new Date().toISOString().replace(/[:.]/g, "-")}_${email}_${reportName.toUpperCase().replace(/ /g, "")}.csv`;

      await uploadReportToAPI(filePath, reportNameWithDate, token);
      deleteFileIfExists(filePath);

      await wait(3000); // Optional pause
    }
  } catch (error) {
    console.error("Error while processing:", error);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    await captureScreenshotOnError(page, errorPath, timestamp);
  } finally {
    console.log("All done, closing browser");
    await browser.close();
    process.exit(0);
  }
}

async function login(page, email, password) {
  await page.goto("https://txs.lotteryservices.com/RetailerWizard/#/home");
  await page.waitForSelector('input[name="loginEmail"]');
  await page.type('input[name="loginEmail"]', email);
  await page.waitForSelector('input[name="passwdRetailer"]');
  await page.type('input[name="passwdRetailer"]', password);

  const buttonsWithLoginText = await page.$$(
    "button ng-transclude translate"
  );
  for (const button of buttonsWithLoginText) {
    const textContent = await button.evaluate((el) => el.textContent.trim());
    if (textContent === "Log In") {
      await button.click();
      console.log('Clicked the "Log In" button');
      break;
    }
  }
  await page.waitForNavigation({ waitUntil: "networkidle0" });
}

async function navigateToReports(page) {
  await page.waitForSelector("a span");
  const reportLinks = await page.$$("a span");

  for (const link of reportLinks) {
    const textContent = await link.evaluate((el) => el.textContent.trim());
    if (textContent === "Reports") {
      const parentAnchor = await link.evaluateHandle(
        (el) => el.parentElement
      );
      await parentAnchor.click();
      console.log('Clicked the "Reports" link');
      break;
    }
  }
  await wait(5000);
}

async function downloadReport(page, reportId, reportName, downloadPath) {
  const dropdownSelector = "#raportName";

  await page.waitForSelector(dropdownSelector);
  await page.click(dropdownSelector);
  console.log(`Opened dropdown for: ${reportName}`);

  await page.waitForSelector("md-option");
  const options = await page.$$("md-option");

  let found = false;
  for (const option of options) {
    const id = await option.evaluate((el) => el.id);
    if (id === reportId) {
      await option.click();
      console.log(`Selected: ${reportName} (ID: ${id})`);
      found = true;
      break;
    }
  }

  if (!found) throw new Error(`❌ Could not find option ID for ${reportName}`);

  const dateStr = formatDate(getYesterdayDate());

  await page.evaluate((date) => {
    document.querySelector("#from-date").value = date;
    document.querySelector("#to-date").value = date;
  }, dateStr);

  await wait(2000);

  for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  console.log("🔍 Triggered search");
  await wait(5000);

  return reportName;
}

async function uploadReportToAPI(filePath, reportName, token) {
  console.log(`Uploading report: ${reportName}`);

  if (!existsSync(filePath)) {
    console.error("File not found:", filePath);
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
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log(response.data);
  } catch (error) {
    console.error(`Error uploading report ${reportName}:`, error.message);
  }
}

export default downloadReports;
