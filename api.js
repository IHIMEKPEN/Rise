// import all required modules
require("dotenv").config();
const client = require("./connection.js"); //import module created ' connection.js'
const express = require("express");
const app = express();
const fs = require("fs");
const multer = require("multer");
const AWS = require("aws-sdk");
const uuid = require("uuid/v4");
// We will use this to make HTTP request to the mp3 link
const axios = require("axios");
// adapters are axios modules that handle dispatching a request and settling a returned Promise once a response is received.
const httpAdapter = require("./node_modules/axios/lib/adapters/http.js");

// production

// This code creates a server listening at the  port specified
app.listen(process.env.PORT, process.env.LOCAL_ADDRESS, () => {
  console.log(`Server is now listening at port ${process.env.PORT}`);
});

// development

//This code creates a server listening at 3300
// const PORT = 3300;
// app.listen(PORT, () => {
//   console.log(`Server is now listening at port ${PORT}`);
// });

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
  const responseData = {
    Status: "Deleted Successfully",
    // Filename: `${filename}`,
  };

  const jsonContent = JSON.stringify(responseData);
  res.send(jsonContent);
});

// dafault api to render index html

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// dafault api to render html

app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});

// create a folder on s3 bucket
AWS.config.region = "us-east-1";
app.post("/folder/:name", upload, (req, res) => {
  var params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${req.params.name}/`,
    ACL: "public-read",
    Body: "body does not matter",
  };

  s3.upload(params, function (err, data) {
    const responseData = {
      Status: "Successfully created your folder on the cloud",
      // folder_added: `${name}`,
    };

    const jsonContent = JSON.stringify(responseData);
    if (err) {
      console.log("Error creating the folder: ", err);
    } else {
      console.log("Successfully created a folder on S3");
      res.send(jsonContent);
    }
  });
});

// create a folder and upload on that folder on s3 bucket
AWS.config.region = "us-east-1";
app.post("/uploadfolderwithfile/:name", upload, (req, res) => {
  let myFile = req.file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];

  var params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${req.params.name}/${myFile[0]}.${fileType}`,
    ACL: "public-read",
    Body: req.file.buffer,
  };

  s3.upload(params, function (err, data) {
    const responseData = {
      Status: "Successfully created your folder and uploaded your file into it on the cloud",
      // folder_added: `${name}`,
    };

    const jsonContent = JSON.stringify(responseData);
    if (err) {
      console.log("Error creating the folder: ", err);
    } else {
      console.log("Successfully created a folder on S3");
      res.send(jsonContent);
      
    }
  });
});

// stream audio

const INPUT = "https://my-rise-bucket.s3.us-east-2.amazonaws.com/Cold.mp3";

app.get("/audio", (req, res) => {
  axios
    .get(INPUT, {
      responseType: "stream",
      adapter: httpAdapter,
      "Content-Range": "bytes 16561-8065611",
    })
    .then((Response) => {
      const stream = Response.data;

      res.set("content-type", "audio/mp3");
      res.set("accept-ranges", "bytes");
      res.set("content-length", Response.headers["content-length"]);
      console.log(Response);

      stream.on("data", (chunk) => {
        res.write(chunk);
      });

      stream.on("error", (err) => {
        res.sendStatus(404);
      });

      stream.on("end", () => {
        res.end();
      });
    })
    .catch((Err) => {
      console.log(Err.message);
    });
});

// stream video

const INPUTt = "https://my-rise-bucket.s3.us-east-2.amazonaws.com/boruto.mp4";

app.get("/video", (req, res) => {
  axios
    .get(INPUTt, {
      responseType: "stream",
      adapter: httpAdapter,
      "Content-Range": "bytes 16561-8065611",
    })
    .then((Response) => {
      const stream = Response.data;

      res.set("content-type", "audio/mp3");
      res.set("accept-ranges", "bytes");
      res.set("content-length", Response.headers["content-length"]);
      console.log(Response);

      stream.on("data", (chunk) => {
        res.write(chunk);
      });

      stream.on("error", (err) => {
        res.sendStatus(404);
      });

      stream.on("end", () => {
        res.end();
      });
    })
    .catch((Err) => {
      console.log(Err.message);
    });
});
