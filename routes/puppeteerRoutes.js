import { Router } from 'express';
const router = Router();
import { runPuppeteer } from '../controllers/puppeteerController.js';
import { testPuppeteer } from '../controllers/testController.js';

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
    });
});

// Test Puppeteer functionality
router.get('/test', testPuppeteer);

router.post('/send-report', runPuppeteer);

export default router;
