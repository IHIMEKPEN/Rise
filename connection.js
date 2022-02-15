// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);

const {Client} = require('pg')

const client = new Client({
    host: "host.docker.internal",
    // host: "localhost",
    user: "postgres",
    port: 5432,
    password: "rootUser",
    database: "postgres"
})

module.exports = client



// export const client = new Client({
//     host: "localhost",
//     user: "postgres",
//     port: 5432,
//     password: "rootUser",
//     database: "postgres"
// });