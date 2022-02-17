// import all required modules
require("dotenv").config();
const client = require("./connection.js"); //import module created ' connection.js'
const express = require("express");
const app = express();
const fs = require("fs");
const multer = require("multer");
const AWS = require("aws-sdk");
const uuid = require("uuid/v4");

// production

// This code creates a server listening at the  port specified
app.listen(process.env.PORT, process.env.LOCAL_ADDRESS, () => {
  console.log(`Server is now listening at port ${process.env.PORT}`);
});

// development

// //This code creates a server listening at 3300
// const PORT=3300
// app.listen(PORT, ()=>{
//     console.log(`Server is now listening at port ${PORT}`);
// })

//  The  client  created  connects to the server.
client.connect();

// Get All Users api
app.get("/users", (req, res) => {
  client.query(`Select * from users`, (err, result) => {
    if (!err) {
      res.send(result.rows);
    }
  });
  client.end;
});

// Get User By Id api
app.get("/users/:id", (req, res) => {
  client.query(
    `Select * from users where id=${req.params.id}`,
    (err, result) => {
      if (!err) {
        res.send(result.rows);
      }
    }
  );
  client.end;
});

// Add New User api

const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.post("/users", (req, res) => {
  const user = req.body;
  let insertQuery = `insert into users(id, fullname, email, passcode) 
                       values(${user.id}, '${user.fullname}', '${user.email}', '${user.passcode}')`;
  const responseData = {
    Status: "Successful",
    fullname_added: `${user.fullname}`,
  };

  const jsonContent = JSON.stringify(responseData);
  client.query(insertQuery, (err, result) => {
    if (!err) {
      res.send(jsonContent);
    } else {
      console.log(err.message);
    }
  });
  client.end;
});

// Update User by id Details api

app.put("/users/:id", (req, res) => {
  let user = req.body;
  let updateQuery = `update users
                       set fullname = '${user.fullname}',
                       email = '${user.email}',
                       passcode = '${user.passcode}'
                       where id = ${user.id}`;

  client.query(updateQuery, (err, result) => {
    const responseData = {
      Status: "Successful",
      fullname_added: `${user.fullname}`,
      email_added: `${user.email}`,
    };

    const jsonContent = JSON.stringify(responseData);
    if (!err) {
      res.send(jsonContent);
    } else {
      console.log(err.message);
    }
  });
  client.end;
});

// Delete a User by id api

app.delete("/users/:id", (req, res) => {
  let insertQuery = `delete from users where id=${req.params.id}`;

  client.query(insertQuery, (err, result) => {
    const responseData = {
      Status: "Successful",
    };

    const jsonContent = JSON.stringify(responseData);
    if (!err) {
      res.send(jsonContent);
    } else {
      console.log(err.message);
    }
  });
  client.end;
});

// upload files with s3 bucket

// const con = require('dotenv/config');

require("dotenv").config();

// const express = require('express')

// const app = express()
const port = 3300;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

const upload = multer({ storage }).single("file");

// upload a file api

app.post("/upload", upload, (req, res) => {
  let myFile = req.file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${myFile[0]}.${fileType}`,
    Body: req.file.buffer,
  };

  s3.upload(params, (error, data) => {
    if (error) {
      res.status(500).send(error);
    }
    const responseData = {
      Status: "Successful",
      Filename: `${data.Key}`,
    };

    const jsonContent = JSON.stringify(responseData);

    res.status(200).send(jsonContent);
  });
});

// download files api

app.get("/download/:filename", async (req, res) => {
  const filename = req.params.filename;
  let x = await s3
    .getObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: filename })
    .promise();
  const responseData = {
    Status: "Download Successful",
    Filename: `${filename}`,
  };

  const jsonContent = JSON.stringify(responseData);
  // res.send(x.Body)
  res.send(jsonContent);
});

app.get("/list", async (req, res) => {
  let r = await s3
    .listObjectsV2({ Bucket: process.env.AWS_BUCKET_NAME })
    .promise();
  let x = r.Contents.map((item) => item.Key);
  res.send(x);
});

// delete uploaded files api

app.delete("/delete/:filename", async (req, res) => {
  const filename = req.params.filename;
  await s3
    .deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: filename })
    .promise();
  res.send(`${filename} Deleted Successfully`);
});

// dafault api to render index html

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// dafault api to render html

app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});

// stream video api

app.get("/video", function (req, res) {
  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 61MB)
  const videoPath = "tim.mp4";
  const videoSize = fs.statSync("tim.mp4").size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

// create a folder on s3 bucket
AWS.config.region = 'us-east-1';
app.post("/folder", upload, (req, res) => {
  var params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: "folderInBucket/",
    ACL: "public-read",
    Body: "body does not matter",
  };

  s3.upload(params, function (err, data) {
    if (err) {
      console.log("Error creating the folder: ", err);
    } else {
      console.log("Successfully created a folder on S3");
      res.send("Successfully created a folder on the cloud");
    }
  });
});
