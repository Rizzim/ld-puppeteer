import express, { json } from 'express';
import routes from './utils/routes.js';
import { resolve } from 'path';
const app = express();

app.use(json());
// Serve the images directory as static
app.use('/images', express.static(resolve('images')));
routes(app);

const PORT = process.env.PORT || 8020;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
