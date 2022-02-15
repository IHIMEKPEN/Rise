// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
require('dotenv').config();

const {Client} = require('pg')

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// const client = new Client({
//     host: "host.docker.internal",
//     // host: "localhost",
//     user: "postgres",
//     port: 5432,
//     password: "rootUser",
//     database: "postgres"
// })

// // deployed database
// const client = new Client({
//     host: "ec2-54-83-21-198.compute-1.amazonaws.com",    
//     user: "xnwumytihbkzgc",
//     port: 5432,
//     password: "rootUser",
//     database: "deaacc7f0aaf9f5bd6c0a420791b326a83cb228fffee617ce81f25bd8abf368d"
// })

module.exports = client



// export const client = new Client({
//     host: "localhost",
//     user: "postgres",
//     port: 5432,
//     password: "rootUser",
//     database: "postgres"
// });