const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register');
const signin = require('./controllers/signin');

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'danilo',
    password : 'danilo',
    database : 'smart-brain'
  }
});

db.select('*').from('users').then(data => {
	// console.log(data);
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/signin', (req, res) => { signin.handleSignIn(req, res, db ,bcrypt) })

app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	db.select('*')
	.from('users')
	.where({ id: id})
	.then(user => {
		if(user.length){
			res.json(user[0]);
		} else {
			res.status(400).json('Not Found')
		}
	})
	.catch( err => res.status(400).json('Error getting user'))
})

app.put('/image', (req, res) => {
	const { id } = req.body;
	db('users').where('id', '=', id)
	.increment('entries', 1)
	.returning('entries')
	.then(entries => {
		res.json(entries[0]);
	})
	.catch(err => res.status(400).json('Unable to get entries'))
})

app.listen(3001, ()=>{
	console.log('app is running');
})


/*
/ --> res = this is working
/signin --> POST success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user (count the rank)

*/