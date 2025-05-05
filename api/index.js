import express, { json } from 'express';
import routes from '../utils/routes.js';
const app = express();

app.use(json());
routes(app);

app.get("/", (req, res) => res.send("Express on Vercel"));

export default app;

// const PORT = process.env.PORT || 8020;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
