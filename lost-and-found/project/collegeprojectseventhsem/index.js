require('dotenv').config();
const express = require('express');
const app = express();
const ejs = require('ejs');
const adminPanel = require('./routes/AdminRoute');
const mysql = require('mysql');
const session = require('express-session');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

const bcrypt = require('bcrypt');
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended : true}));

//salting for bcrypt hash
const saltingRounds = 10;

//session code 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());


//Create connection
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : process.env.DB_USER,
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

let findUserById = (id) => {
  return new Promise((resolve,reject) => {
    try {
      connection.query('SELECT * FROM `loginsystem` WHERE `id` = ?',[id], function (error, results, fields) {
        if(error) reject(error);
        let user = results[0];
        resolve(user);
    })
    }catch(e){
      reject(e);
    }
  });
}

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findUserById(id).then((user) => {
    return done(null,user); 
  }).catch(error => {return done(error,null)});
});

var error = '';

app.get('/',(req,res) => {
  res.render('home');
});

app.get('/home',(req,res) => {
  res.render('home');
});

app.post('/',(req,res) => {

  let dateLost = req.body.searchdate;
  let terminalLost = req.body.terminal;
  let displayQuery = 'SELECT * FROM `lostitems` WHERE `terminal` = ? && `lostdate` = ?';
    let data = null;
    connection.query(displayQuery,[terminalLost,dateLost],function(err,result){
        if(err){
          console.log(err);
        }else if(result.length == 0){
          res.render('home',{Lostitems : ''});
        }else{
          data = result;
          res.render('home',{Lostitems : data});
        }
    })
});

app.get('/login',(req,res) => {
  if(req.isAuthenticated()){
    res.redirect('/adminpanel');
  }else{
    res.render('login');
  }
    
});

app.get('/adminpanel',(req,res) => {
  if(req.isAuthenticated()){
    res.render('adminpanel');
  }else{
    res.redirect('/login');
  }
});

app.get('/logout',(req,res) => {
  req.logout();  
  res.redirect('/login');
});

passport.use(new LocalStrategy(
  function(username, password, done) {
  
          connection.query(
            "SELECT * FROM `loginsystem` WHERE `dashboard_username` = ?",
            [username],
            function (error, results, fields) {
              if (error) {
                return done(err);
              }else if(!results.length){
                return done(null, false);        
              } 
              else {
                bcrypt.compare(password,results[0].dashboard_password, function(err, result) {
                  if(err){
                    return done(err);
                  }else{
                    if(result){
                      return done(null,results[0]);
                    }else{
                      return done(null,false);
                    }
                  }
              });
                
              } 
              // error will be an Error if one occurred during the query
              // results will contain the results of the query
              // fields will contain information about the returned results fields (if any)
            }
          );
  }
));

app.post('/login',
passport.authenticate('local', { successRedirect: '/adminpanel',failureRedirect: '/login' }));

app.get('/contact',(req,res) => {
  res.render('contact');
});

app.get('/about',(req,res) => {
  res.render('about');
});

app.get('/guidelines',(req,res) => {
  res.render('guidelines');
});

//Admin panel Code
app.use('adminpanel',adminPanel);

app.post('/additem',(req,res) => {
 let item = {
   datelost : req.body.lostdate,
   itemterminal : req.body.terminal,
   category : req.body.itemcategory,
   detail : req.body.detailitem
 }

 let insertQuery = "INSERT INTO lostitems (lostdate,terminal,category,details) VALUES(?,?,?,?)";

 connection.query(
   insertQuery,
   [item.datelost, item.itemterminal, item.category, item.detail],
   (err,result,fields) => {
     if(err){
      console.log('Not Inserted : '+err);
     }else{
      res.redirect('/adminpanel');
     } 
   }
 );
});

app.post('/removeitem',(req,res) => {
  let dateremove = req.body.dateofadd;

  let deleteItemQuery = 'DELETE FROM `lostitems` WHERE `lostdate` = ?';
  connection.query(deleteItemQuery,[dateremove],(err,results) => {
    if(err){
      console.log('Error - ');
    }else if(!results){
      console.log('Not inserted !');
      
    }else{
      res.redirect('/adminpanel');
    }
  })
})


//server code
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

