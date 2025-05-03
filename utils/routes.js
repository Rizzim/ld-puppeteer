import { json } from 'express';
import puppeteerRoutes from '../routes/puppeteerRoutes.js';
import errorHandler from '../middlewares/errorHandler.js';

export default function (app){
    app.use(json());
    app.use("/api/puppeteer", puppeteerRoutes);
    app.use(errorHandler);
}