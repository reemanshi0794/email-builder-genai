
const express = require('express');
require('dotenv').config();
const { runPipeline } = require('./pipeline');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  try {
    console.log("🚀 Running AI pipeline on startup...");
    const result = await runPipeline();
    console.log("resultresultresultresult",JSON.stringify(result, null, 2))
    
  } catch (err) {
    console.error("Error running AI pipeline:", err.message);
  }
});
