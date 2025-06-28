const fs = require('fs');
const formidable = require('formidable');
const http = require('http');
const path = require('path');
let port = 7000;


// Create the HTTP server
const server = http.createServer((req, res) => {
  // Handle file upload on POST request to /upload
  if (req.url == '/upload' && req.method.toLowerCase() === 'post') {
    let form = new formidable.IncomingForm();
    // Parse the incoming form data
    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error parsing the file');
        return;
      }
      const uploadedFile = files.uploads?.[0];// Get the uploaded file
      if (!uploadedFile) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('No file !!');
        return;
      }
      let oPath = uploadedFile.filepath;// Temp file path
      let nPath = path.join(__dirname, 'uploads', uploadedFile.originalFilename);// Destination path
      fs.rename(oPath, nPath, (err) => {
        if (err) throw err;
        res.write('File Uploaded and Shifted!');
        res.end();
      })
    });
  } else {
    // Serve the HTML form when not uploading
    res.writeHead(200, { 'Content-type': 'text/html' });
    let htmlFile = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf-8')
    res.end(htmlFile);
  }
})

server.listen(port, () => {
  console.log("Server Running at 7000 port")

})