const uniqueNameing = require('./utils/uniqueNameing.js')
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
      // Check for error while parsing the form
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error parsing the file');
        return;
      }
      // console.log("FILES RECEIVED ===>", files); this is for loging the details of uploaded file.
      const uploaded = files.uploads;
      if (!uploaded) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('No file !!');
        return;
      }
      const uploadedFiles = Array.isArray(uploaded) ? uploaded : [uploaded]; // Ensure uploaded files are in an array
      let count = 0; // Set the intial count to track processed files the forEach Loop

      uploadedFiles.forEach(file => {
        if (!file || !file.originalFilename) {
          return;
        }
        const uniqueName = uniqueNameing(file); // Generate a unique filename using crypto for secure storage

        if (!uniqueName) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Failed to genrate the file name !!');
          return;
        }

        let oldPath = file.filepath; // Temporary file path
        let newPath = path.join(__dirname, 'uploads', uniqueName);// Destination path with its unique name.
        fs.rename(oldPath, newPath, (err) => { // Move file from temporary path to the final uploads folder
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error saving the file');
            return;
          }

          count++;
          if (count === uploadedFiles.length) {
            res.writeHead(200, { 'content-type': 'text/html' });
            res.end('File Uploaded and Shifted!');
          }
        })
      });
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