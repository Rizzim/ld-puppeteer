import { Router } from 'express';
const router = Router();
import { runPuppeteer } from '../controllers/puppeteerController.js';

router.post('/send-report', runPuppeteer);

export default router;
