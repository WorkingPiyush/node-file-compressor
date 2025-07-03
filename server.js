const uniqueNameing = require('./utils/uniqueNaming.js')
const fs = require('fs');
const formidable = require('formidable');
const http = require('http');
const path = require('path');
const zlib = require('zlib')
const port = 7000;


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
        const tempPath = file.filepath;
        // const fileName = file.originalFilename
        const gzipPath = tempPath + '.gz';

        const readFile = fs.createReadStream(tempPath);
        const writeFile = fs.createWriteStream(gzipPath);
        const gzip = zlib.createGzip();

        readFile.pipe(gzip).pipe(writeFile).on('finish', () => {
          const rawName = uniqueNameing(file) // Generate a unique filename using crypto for secure storage
          const uniqueName = path.basename(rawName) + `.gz`
          if (!uniqueName) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Failed to genrate the file name !!');
            return;
          }
          let newPath = path.join(__dirname, 'uploads', uniqueName);// Destination path with its unique name.
          fs.rename(gzipPath, newPath, (err) => { // Move file from temporary path to the final uploads folder
            if (err) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Error saving the file');
              return;
            }
            fs.unlink(tempPath, () => { }); // Removing the temporary files from the temporary storage.
            // Adding a file named fileData.json to store compressed files and their original names.
            const metaDataInfo = path.join(__dirname, 'uploads', 'fileData.json');
            let data = {};
            if (fs.existsSync(metaDataInfo)) {
              try {
                data = JSON.parse(fs.readFileSync(metaDataInfo, 'utf-8'))
              } catch (error) {
                console.error("Error while parsing the json file", error.message);
                data = {};
              }
            }
            // 'aa6cbdffdbef36f9fe2ee7ad494c7bbe1c8ed384f08dc1d25c3680454f0bde37.pdf.gz': 'Software_Engineer_Core_Roadmap.pdf', JSON Representation
            data[uniqueName] = file.originalFilename;
            fs.writeFileSync(metaDataInfo, JSON.stringify(data, null, 2));
            // console.log(fileData) Printing the json  data by importing the file 
            count++;
            if (count === uploadedFiles.length) {
              res.writeHead(200, { 'content-type': 'text/html' });
              res.end('<h3>File uploaded and compressed successfully!</h3>');
            }
          })
        });
      });
    })
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