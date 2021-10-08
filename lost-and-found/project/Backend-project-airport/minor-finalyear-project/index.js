const express = require('express')
const app = express();
const ejs = require('ejs');
const mongoose = require('mongoose');
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended : true}));

//Create connection
mongoose.connect('mongodb://localhost:27017/adminlogin');

const connection = mongoose.connection;
connection.once('open',() => {
  console.log('Connection created successfully !');
});
//Create Schema
const adminSchema = new mongoose.Schema({
  username : {
    type : String,
    required : [true, 'User Name is required']
  },
  password : {
    type : String,
    required : [true, 'Password is required']
  }
});

const Admin = new mongoose.model('admin',adminSchema);
const user = new Admin({
  username : 'syed',
  password : 'syed'
})
user.save(); 
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

app.post('/login',(req,res) => {
  var userName = req.body.username;
  var passwordBox = req.body.password;
  
  if(userName == '' || passwordBox == ''){
    error = 'username and password must be filled';
    res.render('login',{message : error});
  }

  Admin.findOne({username : userName}, (err,user) => {
    if(err){
      console.log(err);
    }else {
      if(user){
        if(user.password === passwordBox){
          res.render('adminpanel');
        }
      }else {
        error = 'incorrect user credentials';
        res.render('login',{message : error});
      }
    }
  })
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