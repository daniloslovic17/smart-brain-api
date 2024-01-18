const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const knex = require('knex');

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

app.post('/signin', (req, res) => {
	db.select('email', 'hash').from('login')
	.where('email', '=', req.body.email)
	.then(data => {
		const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
		if (isValid){
			return db.select('*').from('users')
			.where('email', '=', req.body.email)
			.then(user => {
				res.json(user[0])
			})
			.catch(err => res.status(400).json('Unable to get user'))
		} else {
			res.status(400).json('Wrong credentials');
		}
	})
	.catch(err => res.status(400).json('Wrong credentials'))
})

app.post('/register', (req, res) => {
	const { email, name, password } = req.body;
	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync(password, salt);
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		})
		.into('login')
		.returning('email')
		.then(loginEmail => {
			trx('users')
			.returning('*')
			.insert({
				email: loginEmail[0]['email'],
				name: name,
				joined: new Date()
				})
			.then(user => {
				res.json(user[0]);
			})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => res.status(400).json('Unable to Register'));
})

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