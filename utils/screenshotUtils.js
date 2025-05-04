import { join } from "path";

export const captureScreenshotOnError = async (page, errorPath, timestamp) => {
  const screenshotPath = join(errorPath, `error_${timestamp}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`Screenshot saved: ${screenshotPath}`);
};
