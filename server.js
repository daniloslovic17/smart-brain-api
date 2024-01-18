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

const database = {
	users: [
		{
			id: '123',
			name: 'John',
			email: 'john@gmail.com',
			password: 'cookies',
			entries: 0,
			joined: new Date()
		},
		{
			id: '1234',
			name: 'Sally',
			email: 'sally@gmail.com',
			password: 'bananas',
			entries: 0,
			joined: new Date()

		}
	],
	login: [
		{
			id: '987',
			hash: '',
			email: 'john@gmail.com'
		}
	]
}

app.get('/', (req, res) => {
	res.send(database.users);
})

app.post('/signin', (req, res) => {
	// bcrypt.compare("apples", "$2a$10$wRE26jXgAM79vX.pVF497ONcpgqad/GjUNRgqyTJqp3WS/Ke5f2V6", function(err, res) {
    // 	console.log(res);
	// });
	// bcrypt.compare("not_bacon", "$2a$10$wRE26jXgAM79vX.pVF497ONcpgqad/GjUNRgqyTJqp3WS/Ke5f2V6", function(err, res) {
	//     console.log(res);
	// });
	if(req.body.email === database.users[0].email && req.body.password === database.users[0].password){
		res.json(database.users[0]);
	} else {
		res.status(400).json('error logging in');
	}
})

app.post('/register', (req, res) => {
	const { email, name, password } = req.body;
	// bcrypt.genSalt(10, function(err, salt) {
	//     bcrypt.hash(password, salt, function(err, hash) {
	// 			console.log(hash);	        
	//     	});
	// 	}
	// );

	db('users')
	.returning('*')
	.insert({
		email: email,
		name: name,
		joined: new Date()
		})
	.then(user => {
		res.json(user[0]);
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