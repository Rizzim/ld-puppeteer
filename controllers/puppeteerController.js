import downloadReports from '../services/puppeteerService.js';
import asyncHandler from 'express-async-handler';

export const runPuppeteer = asyncHandler(async (req, res) => {
    const { email, password, reportIds } = req.body;

    if (!email || !password || !Array.isArray(reportIds)) {
        res.status(400).json({ message: 'Invalid request parameters' });
        throw new Error("Email, password or reportIds are missing or invalid");
    }

    try {
        await downloadReports(email, password, reportIds);
        res.status(200).json({ message: 'Reports downloaded and processed successfully' });
        process.exit(0);
    } catch (error) {
        res.status(500).json({ message: 'Error downloading reports', error });
        process.exit(1);
    }
});
