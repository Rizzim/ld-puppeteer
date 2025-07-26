import { launch } from 'puppeteer';
import { puppeteerOptions } from '../config/puppeteerConfig.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';
import asyncHandler from 'express-async-handler';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const testPuppeteer = asyncHandler(async (req, res) => {
    try {
        // Launch browser
        const browser = await launch(puppeteerOptions);
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.goto('https://www.utctime.net', { waitUntil: 'networkidle0' });
        const screenshotPath = resolve(__dirname, '../images/test-screenshot.png');
        const imagesDir = resolve(__dirname, '../images');
        if (!existsSync(imagesDir)) {
            mkdirSync(imagesDir, { recursive: true });
        }
        await page.screenshot({ path: screenshotPath, fullPage: true });
        const title = await page.title();
        await browser.close();
        // Construct the public URL for the screenshot
        const publicUrl = `${req.protocol}://${req.get('host')}/images/test-screenshot.png`;
        res.status(200).json({
            status: 'success',
            message: 'Puppeteer test completed successfully',
            details: {
                title: title,
                screenshotUrl: publicUrl,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Puppeteer test failed',
            error: error.message
        });
    }
}); 