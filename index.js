import express from "express";
import bodyParser from "body-parser";

import usersRoutes from './routes/users.js';

import path from "path";
const __dirname = path.resolve();
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// const path = require("path"); 




// initialze express application 
const app = express();
const PORT = 5000;

// implement a template engine
app.set("views", path.join(__dirname, "views")); 
app.set("view engine" , "ejs");
app.engine('ejs', require('ejs').__express);

app.use(bodyParser.json());

app.use('/users', usersRoutes);



// create route 
app.get('/', (req,res) =>
{
    res.render('index')
}
// res.send('Hello from Homepage.')
);

app.listen(PORT, () => console.log(`Server Running at http://localhost:${PORT}`)); 