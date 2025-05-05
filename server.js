import app from './api/index.js';

const PORT = process.env.PORT || 8020;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});