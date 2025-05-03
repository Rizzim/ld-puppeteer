import express, { json } from 'express';
import routes from './utils/routes.js';
const app = express();

app.use(json());
// routes(app);

// scripts/downloadReports.js
import downloadReports from './services/puppeteerService.js';



const email = 'zmomin89@gmail.com';
const password = 'Duvalmkt@2024';
const token = 'your_token';
const reportIds = ['123', '456'];

(async () => {
  try {
    await downloadReports(email, password, token, reportIds);
    console.log('✅ Reports downloaded successfully');
  } catch (err) {
    console.error('❌ Error downloading reports:', err);
    process.exit(1);
  }
})();

const PORT = process.env.PORT || 8020;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
