// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);

const {Client} = require('pg')

const client = new Client({
    host: "ec2-54-83-21-198.compute-1.amazonaws.com"
    // host: "localhost",
    user: "xnwumytihbkzgc",
    port: 5432,
    password: "deaacc7f0aaf9f5bd6c0a420791b326a83cb228fffee617ce81f25bd8abf368d",
    database: "dalokhaursqjcq"
})

module.exports = client



// export const client = new Client({
//     host: "localhost",
//     user: "postgres",
//     port: 5432,
//     password: "rootUser",
//     database: "postgres"
// });