const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3033;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));
app.use(express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('LP3I Upload Hub');
});

app.post('/pmbupload', async (req, res) => {
  try {
    const imageData = Buffer.from(req.body.image, 'base64');
    const identity = req.body.identity;
    const fileName = req.body.filename;
    const fileType = req.body.filetype;
    const folderPath = path.join(__dirname, `uploads/${identity}`);
    const destination = path.join(__dirname, `uploads/${identity}`, `${identity}-${fileName}.${fileType}`);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }
    fs.writeFileSync(destination, imageData);
    return res.json({
      status: 200
    })
  } catch (error) {
    return res.json({ error: error })
  }
});

app.delete('/pmbupload', async (req, res) => {
  try {
    const identity = req.body.identity;
    const fileName = req.body.filename;
    const destination = path.join(__dirname, `uploads/${identity}`, `${identity}-${fileName}`);
    fs.access(destination, fs.constants.F_OK, (err) => {
      if(err){
        return res.status(404).json({ error: 'File not found' });
      }

      fs.unlink(destination, (err) => {
        if(err){
          return res.status(500).json({ error: 'Failed to delete file' });
        }
        return res.json({ message: 'File delete successfully' })
      })
    });
  } catch (error) {
    return res.json({ error: error })
  }
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
})
