const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3033;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('LP3I Upload Hub');
});

app.get('/download', (req, res) => {
  const identity = req.query.identity;
  const filename = req.query.filename;
  const filePath = path.join(__dirname, `uploads/${identity}`, `${filename}`);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.sendFile(filePath);
});

app.post('/upload', async (req, res) => {
  try {
    const identity = req.body.identity;
    const namefile = req.body.namefile;
    const typefile = req.body.typefile;
    const imageData = Buffer.from(req.body.image, 'base64');

    const folderPath = path.join(__dirname, `uploads/${identity}`);
    const destination = path.join(__dirname, `uploads/${identity}`, `${identity}-${namefile}.${typefile}`);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }
    fs.writeFileSync(destination, imageData);
    return res.json({
      status: 200
    })
  } catch (error) {
    return res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
});

app.delete('/delete', async (req, res) => {
  try {
    const identity = req.query.identity;
    const nameFile = req.query.namefile;
    const typeFile = req.query.typefile;
    const destination = path.join(__dirname, `uploads/${identity}`, `${identity}-${nameFile}.${typeFile}`);
    fs.access(destination, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).json({ error: 'File not found' });
      }

      fs.unlink(destination, (err) => {
        if (err) {
          return res.json(err);
        }
        return res.json({ message: 'File delete successfully' })
      })
    });
  } catch (error) {
    return res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
})
