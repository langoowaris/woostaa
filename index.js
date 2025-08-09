const fs = require('fs');
const https = require('https');
const http = require('http');
const express = require('express');
const app = express();
app.use(express.static(__dirname + '/public'));
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/woostaa.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/woostaa.com/cert.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/live/woostaa.com/chain.pem')
};

app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/index.html")
})

// HTTP server for redirecting HTTP to HTTPS
http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(80); // Redirect HTTP traffic to HTTPS

// HTTPS server
https.createServer(options, app).listen(443, () => {
  console.log('HTTPS server running on port 443');
});


