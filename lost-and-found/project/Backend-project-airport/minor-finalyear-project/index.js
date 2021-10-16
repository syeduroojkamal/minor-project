require('dotenv').config();
const express = require('express');
const app = express();
const ejs = require('ejs');
const mysql = require('mysql');
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended : true}));

//Create connection
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : process.env.DB_PASS,
  database : process.env.DATABASE
});

 //open mysql connection
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
 
  console.log('connected as id ' + connection.threadId);
});

var error = '';

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/home',(req,res) => {
  res.render('home');
});

app.get('/login',(req,res) => {
  error = '';
  res.render('login', {message : error});
});

app.get('/adminpanel',(req,res) => {
  res.render('adminpanel');
});

app.post('/login',(req,res) => {
  var userName = req.body.username;
  var passWord = req.body.password;
  
  if(userName == '' || passWord == ''){
    error = 'please fill the login details';
    res.render('login',{message : error});
  }else {
    connection.query(
      "SELECT * FROM `loginadmin` WHERE `user_name` = ? && `user_password` = ?",
      [userName, passWord],
      function (error, results, fields) {
        if(error){
          console.log(error);
          return;
        }else if(results.length > 0){
          res.redirect('/adminpanel');
        }else {
          error = 'Incorrect username and password';
          res.render('login',{message : error});
        }
        
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
      }
    );
  }  
});


app.get('/contact',(req,res) => {
  res.render('contact');
});

app.get('/about',(req,res) => {
  res.render('about');
});

app.get('/guidelines',(req,res) => {
  res.render('guidelines');
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});