// import { client } from './connection.js'
// import express from "express";
// import bodyParser from "body-parser";

// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);


const client = require('./connection.js')
const express = require('express');
const app = express();

app.listen(80, ()=>{
    console.log("Server is now listening at port 80");
})

client.connect();

app.get('/db', async (req, res) => {
    try {
    //   const client = await client.connect();
      const result = await client.query('SELECT * FROM users');
      const results = { 'results': (result) ? result.rows : null};
      res.send(result.rows);
    //   client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

// Get All Users
app.get('/users', (req, res)=>{
    client.query(`Select * from users`, (err, result)=>{
        if(!err){
            res.send(result.rows);
        }
    });
    client.end;
})

// Get User By Id
app.get('/users/:id', (req, res)=>{
    client.query(`Select * from users where id=${req.params.id}`, (err, result)=>{
        if(!err){
            res.send(result.rows);
        }
    });
    client.end;
})

// Add New User

const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.post('/users', (req, res)=> {
    const user = req.body;
    let insertQuery = `insert into users(id, fullname, email, passcode) 
                       values(${user.id}, '${user.fullname}', '${user.email}', '${user.passcode}')`

    client.query(insertQuery, (err, result)=>{
        if(!err){
            res.send('Insertion was successful')
        }
        else{ console.log(err.message) }
    })
    client.end;
})

// Update User Details
app.put('/users/:id', (req, res)=> {
    let user = req.body;
    let updateQuery = `update users
                       set firstname = '${user.firstname}',
                       lastname = '${user.lastname}',
                       location = '${user.location}'
                       where id = ${user.id}`

    client.query(updateQuery, (err, result)=>{
        if(!err){
            res.send('Update was successful')
        }
        else{ console.log(err.message) }
    })
    client.end;
})

// Delete a User

app.delete('/users/:id', (req, res)=> {
    let insertQuery = `delete from users where id=${req.params.id}`

    client.query(insertQuery, (err, result)=>{
        if(!err){
            res.send('Deletion was successful')
        }
        else{ console.log(err.message) }
    })
    client.end;
})


// upload files with s3 bucket

// const con = require('dotenv/config');
require('dotenv').config();


// const express = require('express')
const multer = require('multer')
const AWS = require('aws-sdk')
const uuid = require('uuid/v4')

// const app = express()
const port = 3300

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
})

const storage = multer.memoryStorage({
    destination: function(req, file, callback) {
        callback(null, '')
    }
})

const upload = multer({storage}).single('image')

app.post('/upload',upload,(req, res) => {

    let myFile = req.file.originalname.split(".")
    const fileType = myFile[myFile.length - 1]

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${myFile[0]}.${fileType}`,
        Body: req.file.buffer
    }

    s3.upload(params, (error, data) => {
        if(error){
            res.status(500).send(error)
        }

        res.status(200).send(data)
    })
})

// download files 

app.get("/download/:filename", async (req, res) => {
    const filename = req.params.filename
    let x = await s3.getObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: filename }).promise();
    res.send(x.Body)
})

app.get("/list", async (req, res) => {

    let r = await s3.listObjectsV2({ Bucket: process.env.AWS_BUCKET_NAME }).promise();
    let x = r.Contents.map(item => item.Key);
    res.send(x)
})

// delete uploaded files

app.delete("/delete/:filename", async (req, res) => {
    const filename = req.params.filename
    await s3.deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: filename }).promise();
    res.send(`${filename} Deleted Successfully`)

})

// // create a bucket

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// app.post('/folder', async(req, res) => {

//     // const bucketName = req.body;
//     // const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// const createBucket = (bucketName) => {
//     // Create the parameters for calling createBucket
//     var bucketParams = {
//         Bucket : bucketName
//     };
  
//     // call S3 to create the bucket
//     s3.createBucket(bucketParams, function(err, data) {
//         if (err) {
//             console.log("Error", err);
//             res.send('Error')
//         } else {
//             console.log("Success", data.Location);
//             res.send(`Folder ${filename} Created Successfully`)
//         }
//     });
// }

// createBucket(req.body.foldername)

// })


// // compression

// const compression = require('compression')

// app.use(compression())


// module.exports.GetAllUser = GetAllUser;
// module.exports.GetbyUserId = GetbyUserId;
// module.exports.AddNewUser = AddNewUser;
// module.exports.UpdateUser = UpdateUser;
// module.exports.DeleteUser = DeleteUser;
// module.exports.UploadFiles = UploadFiles;
// module.exports.DownloadFiles = DownloadFiles;
// module.exports.DeleteUploadedFiles = DeleteUploadedFiles;
