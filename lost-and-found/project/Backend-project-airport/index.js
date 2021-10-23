require('dotenv').config();
const express = require('express');
const app = express();
const ejs = require('ejs');
const mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcrypt');
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended : true}));

//salting for bcrypt hash
const saltingRounds = 10;

//session code 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

//Create connection
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : process.env.DB_PASS,
  database : process.env.DATABASE
});

// open mysql connection
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
 
  console.log('connected as id ' + connection.threadId);
});

// bcrypt.hash('somepass', saltingRounds, function(err, hash) {
//   // Store hash in your password DB.
//   if(err){
//     console.log(err);
//   }else{
//     var query = connection.query(
//       "INSERT INTO `loginsystem` (`dashboard_username`, `dashboard_password`) VALUES (?,?)",
//       ['syed',hash],
//       function (error, results, fields) {
//         if (error) {
//           console.log(error);
//         }
//         // Neat!
//       }
//     );
//     console.log(query);
//   }
// });

var error = '';

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/home',(req,res) => {
  res.render('home');
});

app.get('/login',(req,res) => {
  error = '';
  if(req.session.userId){
    res.render('adminpanel');  
  }else {
    res.render('login', {message : error});
  }
  
});

app.get('/adminpanel',(req,res) => {
  res.render('adminpanel');
});


app.get('/logout',(req,res) => {
  req.session.destroy((err) => {
    if(err){
      console.log(err);
    }else{
      // connection.end();
      res.redirect('/login');
    }
  })
});

app.post('/login',(req,res) => {
  var userName = req.body.username;
  var passWord = req.body.password;
  if(userName == '' || passWord == ''){
    error = 'please fill the login details';
    res.render('login',{message : error});
  }else {
    connection.query(
      "SELECT * FROM `loginsystem` WHERE `dashboard_username` = ?",
      [userName],
      function (error, results, fields) {
        if (error) {
          console.log(error);
          return;
        } else if (results.length > 0) {
          bcrypt.compare(passWord,results[0].dashboard_password, function(err, result) {
            if(err){
              console.log(err);
            }else{
              if(result){
                req.session.userId = userName;
                res.redirect('/adminpanel');
              }else{
                error = 'Incorrect user credentials';
                res.render('login',{message : error});
              }
            }
        });
          
        }else{
          error = 'Incorrect user credentials';
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


