const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const imageAPI = require('./controllers/imageAPI');

const db = knex({
  client: 'pg',
  connection: {
    host : process.env.DBHOST,
    port : 5432,
    user : process.env.DBUSER,
    password : process.env.DBPASS,
    database : process.env.DBNAME
  }
});

db.select('*').from('users').then(data => {
	// console.log(data);
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => { res.send('it is working!') })

app.post('/signin', (req, res) => { signin.handleSignIn(req, res, db ,bcrypt) })

app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })

app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db) })

app.put('/image', (req, res) => { image.handleImage(req, res, db) })

app.post('/imageapi', (req, res) => { imageAPI.handleImageAPI(req, res) })

app.listen(process.env.PORT || 3001, ()=>{
	console.log('app is running');
})


/*
/ --> res = this is working
/signin --> POST success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user (count the rank)

*/