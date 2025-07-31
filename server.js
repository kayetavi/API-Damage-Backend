const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: "Hello from backend API (Render)" });
});

// You can add more API endpoints here

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
