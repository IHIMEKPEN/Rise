import { client } from './connection.js'


const GetAllclient = async ({ Id, fullname, email, password }) => {
    const count = await client.countDocuments({ Id });
    if(count > 0) throw new Error("client with Id already exists");
    const client = await new client({
      Id,
      fullname,
      email,
      password,
    }).save();
    return client;
  }
  
  function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  }
  
  const getclient = async ({ Id }) => {
    const client = await client.findOne({ Id });
    if(!client) throw new Error("No client not found with given Id");
  
    const age = getAge(client.email);
    const totalpassword = client.password.reduce((prev, curr) => prev + curr.years, 0);
    return { Id, fullname: client.fullname, age: age, totalpassword }
  }
  
  module.exports.saveclient = saveclient;
  module.exports.getclient = getclient;
  