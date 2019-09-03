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
app.get('/',function(req,res){
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/inserttask',function(req,res){
  res.sendFile(__dirname + '/views/inserttask.html');
}) ;

app.post('/addTask',function(req,res){
  let record = req.body;
  console.log(record);
  db.collection('tasks').insertOne(
    {
      taskID:Math.round(Math.random()*1000),
      TaskName:record.TaskName,
      AssignTo:record.AssignTo,
      DueDate:record.DueDate,
      TaskStatus:record.TaskStatus,
      TaskDes:record.TaskDes
    });
  res.redirect('/listtasks');
});
app.get('/listtasks',function(req,res){
  db.collection('tasks').find({}).toArray(function (err, data) {
    console.log(data);
    res.render('listtasks.html', { tasksDb: data });
  });
});

app.get('/deletetask',function(req,res){
  res.sendFile(__dirname + '/views/deletetask.html');
});

app.post('/deletetaskdata', function (req, res) {
  let record = req.body;
  let filter = { taskID: parseInt(record.taskID)};
  db.collection('tasks').deleteOne(filter);
  res.redirect('/listtasks');
});

app.get('/deletecompleted',function(req,res){
  let Completed = {TaskStatus: 'Completed'}
  db.collection('tasks').deleteMany(Completed);
  res.redirect('/listtasks');
});

app.get('/updatetask',function(req,res){
  res.sendFile(__dirname + '/views/updatetask.html');
});

app.post('/updatetaskdata',function(req,res){
  let record = req.body;
  db.collection('tasks').updateOne({taskID:parseInt(record.taskID)},{$set: {TaskStatus:record.newStatus}});
  res.redirect('/listtasks');
});

app.get('/deleteOldComplete',function(req,res){
  let passDue = new Date('2019-08-30');
  db.collection('tasks').deleteMany({TaskStatus: 'Completed'},{$min:{DueDate: passDue}});
  res.redirect('/listtasks');
});