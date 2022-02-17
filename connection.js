// import all modules required
require('dotenv').config();

const {Client} = require('pg')

// connect to postgres database deployed on heroku
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


// export client as module to be used in api.js 
module.exports = client


