import express, { json } from 'express';
import routes from './utils/routes.js';
const app = express();

app.use(json());
routes(app);

const PORT = process.env.PORT || 8020;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});