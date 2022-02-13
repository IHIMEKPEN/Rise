import express from "express";

const router = express.Router();

const users = [
    {
        firstname: "john",
        lastname: "Doe",
        age: "25"
    },
    {
        firstname: "Clement",
        lastname: "Williams",
        age: "21"
    },

]

// all routes here starts with /users
router.get('/', (req,res)=>{
    console.log(users);

    res.send(users);
});

router.post('/',(req,res)=>{ 
    // console.log('POST ROUTE REACHED');
    const user = req.body;

    users.push(user);

    res.send(`User with the name ${user.firstname} added to the database!`);
    res.send(users);
} );


export default router;