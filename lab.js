const express = require("express");
const mongodb = require("mongodb");
const bodyparser = require('body-parser');
const morgan = require('morgan');
//Configure Express
const app = express()
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static('public'));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(morgan('common'));
app.use(express.static('css'));
app.listen(8080);
//Configure MongoDB
const MongoClient = mongodb.MongoClient;
// Connection URL
const url = "mongodb://localhost:27017/";
//reference to the database (i.e. collection)
let db;
//Connect to mongoDB server
MongoClient.connect(url, { useNewUrlParser: true },
    function (err, client) {
        if (err) {
            console.log("Err  ", err);
        } else {
            console.log("Connected successfully to server");
            db = client.db("fit2095db");
        }
    });
//Routes Handlers
//Insert new User
//GET request: send the page to the client
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});
//POST request: receive the details from the client and insert new document (i.e. object) to the collection (i.e. table)
app.post('/addnewuser', function (req, res) {
    let userDetails = req.body;
    db.collection('tasks').insertOne({ name: userDetails.uname, age: userDetails.uage, address: userDetails.uaddress });
    res.redirect('/gettasks'); // redirect the client to list users page
});
//List all users
//GET request: send the page to the client. Get the list of documents form the collections and send it to the rendering engine
app.get('/gettasks', function (req, res) {
    db.collection('tasks').find({}).toArray(function (err, data) {
        res.render('listusers', { usersDb: data });
    });
});
//Update user: 
//GET request: send the page to the client 
app.get('/updateuser', function (req, res) {
    res.sendFile(__dirname + '/views/updateuser.html');
});
//POST request: receive the details from the client and do the update
app.post('/updatetaskdata', function (req, res) {
    let userDetails = req.body;
    let filter = { name: userDetails.unameold };
    let theUpdate = { $set: { name: userDetails.unamenew, age: userDetails.uagenew, address: userDetails.uaddressnew } };
    db.collection('tasks').updateOne(filter, theUpdate);
    res.redirect('/gettasks');// redirect the client to list users page
})
//Update User: 
//GET request: send the page to the client to enter the user's name
app.get('/deletetask', function (req, res) {
    res.sendFile(__dirname + '/views/deleteuser.html');
});
app.get('/deleteComplete',function(req,res){
    db.collection('tasks').deleteMany({TaskStatus:'Completed'});
})
//POST request: receive the user's name and do the delete operation 
app.post('/deletetaskdata', function (req, res) {
    let record = req.body;
    let filter = { taskID: record.taskID };
    db.collection('tasks').deleteOne(filter);
    res.redirect('/gettasks');// redirect the client to list users page
});