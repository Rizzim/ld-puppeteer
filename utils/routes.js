import { json } from 'express';
import puppeteerRoutes from '../routes/puppeteerRoutes.js';
import errorHandler from '../middlewares/errorHandler.js';

export default function (app){
    app.use(json());
    // Home route
    app.get('/', (req, res) => {
        res.json({ status: 'ok', message: 'Puppeteer Sales Automation is running!' });
    });
    app.use("/api/puppeteer", puppeteerRoutes);
    app.use(errorHandler);
}