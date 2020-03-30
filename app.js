const express = require('express'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	LocalStrategy = require('passport-local'),
	flash = require('connect-flash'),
	middleware = require('./middleware/index');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', function(socket) {
	console.log('a user connected');
});

// ------------------------------------------ //
// 			MONGOOSE CONFIGURATION
// ------------------------------------------ //
require('dotenv').config();
const Mongo_URI = process.env.ATLAS_URI;
const mapKey = process.env.mapKey;

// const Mongo_URI = 'mongodb://localhost/sapflow';
mongoose
	.connect(Mongo_URI, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: false
	})
	.then((result) => {
		console.log('DB Connected!');
	})
	.catch((err) => {
		console.log(err);
	});

// ------------------------------------------ //
// 			MODELS CONFIG
// ------------------------------------------ //
const Tree = require('./models/tree');
const Sensor = require('./models/sensor');
const Data = require('./models/data');
const User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
app.use(flash());

// PASSPORT CONFIG
app.use(
	require('express-session')({
		secret: 'Sapflow Project',
		resave: false,
		saveUninitialized: false
	})
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});

app.get('/', (req, res) => {
	res.render('index', { currentUser: req.user });
});

//
// 	REGISTER
//

// SHOW - Login form
app.get('/register', (req, res) => {
	res.render('register');
});

// SHOW - Login form
app.post('/register', (req, res) => {
	let newUser = new User({ username: req.body.username });

	User.register(newUser, req.body.password, (err, user) => {
		if (err) {
			req.flash('error', err.message);
			return res.redirect('register');
		} else {
			passport.authenticate('local')(req, res, () => {
				req.flash('success', 'Registered as ' + user.username);
				res.redirect('/');
			});
		}
	});
});

//
// 	LOGIN
//


// SHOW - Login form
app.get('/login', (req, res) => {
	res.render('login');
});
// Handle login logic
app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }), (req, res) => {
	res.send('Login Success');
});

// logout route
app.get('/logout', (req, res) => {
	req.logOut();
	req.flash('success', 'Logged out.');
	res.redirect('/');
});

//
// 	CHART
//


// API for fetching data to plot chart for past 24 hrs
app.get('/chart', (req, res) => {
	const currentTime = new Date().toISOString();
	let parseTime = new Date().setDate(new Date().getDate() - 1); // parse from last 24 hrs
	parseTime = new Date(parseTime).toISOString();
	console.log(`Now: ${currentTime} Parse: ${parseTime}`);
	console.log(`Now: ${currentTime.toString()} Parse: ${parseTime.toString()}`);

	Sensor.find({
		date: {
			$gte: parseTime,
			$lte: currentTime
		}
	})
		.then((data) => {
			res.json({ success: true, data: data });
		})
		.catch((err) => {
			console.log(err);
		});
});
// API for fetching data to plot chart for past week
app.get('/chart/week', (req, res) => {
	const currentTime = new Date().toISOString();
	let parseTime = new Date().setDate(new Date().getDate() - 7); // parse from past week
	parseTime = new Date(parseTime).toISOString();
	console.log(`Now: ${currentTime} Parse: ${parseTime}`);
	console.log(`Now: ${currentTime.toString()} Parse: ${parseTime.toString()}`);

	Sensor.find({
		date: {
			$gte: parseTime,
			$lte: currentTime
		}
	})
		.then((data) => {
			res.json({ success: true, data: data });
		})
		.catch((err) => {
			console.log(err);
		});
});


//
// 	SENSOR
//

// GET - see all sensor data
app.get('/sensor', middleware.isLoggedIn, (req, res) => {
	let sensorArr = [];
	let dev_id = [];
	Sensor.find({})
		.then((result) => {
			for (i = 0; i < result.length; i++) {
				// if unique doc
				if (!dev_id.includes(result[i].dev_id)) {
					let sensor = {
						_id: result[i]._id,
						dev_id: result[i].dev_id,
						forest: result[i].forest,
						long: result[i].long,
						lat: result[i].lat,
						tree_id: result[i].tree_id,
						species: result[i].species,
					};
					dev_id.push(result[i].dev_id);
					sensorArr.push(sensor);
				}
			}
			res.render('./sensors/index', { sensorArr: sensorArr, currentUser: req.user });
		})
		.catch((err) => {
			console.log(err);
		});
});

// POST - collect data from sensor
app.post('/sensor', (req, res) => {
	// sensor model
	const sensorData = {
		app_id: req.body.app_id,
		dev_id: req.body.dev_id,
		hardware_serial: req.body.hardware_serial,
		downlink_url: req.body.downlink_url,
		batt: req.body.payload_fields.batt,
		snr1: req.body.payload_fields.snr1,
		snr2: req.body.payload_fields.snr2,
		snr3: req.body.payload_fields.snr3,
		snr4: req.body.payload_fields.snr4,
		teq1: req.body.payload_fields.teq1,
		teq2: req.body.payload_fields.teq2,
		teq3: req.body.payload_fields.teq3,
		teq4: req.body.payload_fields.teq4,
		lat: req.body.payload_fields.lat,
		long: req.body.payload_fields.long,
		time: req.body.metadata.time
	};

	new Sensor(sensorData)
		.save()
		.then((sensor) => {
			io.emit('update', true);
			console.log('emit new update');
			return res.json('success');
		})
		.catch((err) => {
			console.log(err);
		});
});

// SHOW - information about a sensor
app.get('/sensor/:dev_id', middleware.isLoggedIn, (req, res) => {
	const currentTime = new Date().toISOString();
	let parseTime = new Date().setDate(new Date().getDate() - 1); // parse from last 24 hrs
	parseTime = new Date(parseTime).toISOString();
	console.log(`Now: ${currentTime} Parse: ${parseTime}`);
	console.log(`Now: ${currentTime.toString()} Parse: ${parseTime.toString()}`);

	Sensor.find({
		dev_id: req.params.dev_id,
		date: {
			$gte: parseTime,
			$lte: currentTime
		}
	})
		.then((data) => {
			res.render('./sensors/show', { sensor: data[0] });
		})
		.catch((err) => {
			console.log(err);
		});
});

// UPDATE - update sensor collection
app.put('/sensor/:dev_id', (req, res) => {
	// find all sensor documents and update the fields
	Sensor.updateMany({ dev_id: req.params.dev_id }, req.body.sensor)
		.then((result) => {
			console.log('Updated Sensor Info');
			res.redirect('/sensor/');
		})
		.catch((err) => {
			console.log(err);
			res.redirect('/sensor');
		});
});

// EDIT - edit the sensor document fields
app.get('/sensor/:dev_id/edit', middleware.isLoggedIn, (req, res) => {
	let doc = {};
	Sensor.find({ dev_id: req.params.dev_id })
		.then((sensorArr) => {
			for (i = 0; i < sensorArr.length; i++) {
				if (
					sensorArr[i].lat != undefined &&
					sensorArr[i].long != undefined &&
					sensorArr[i].forest != undefined
				) {
					doc = sensorArr[i];
					break;
				}
			}

			res.render('./sensors/edit', { sensor: doc });
		})
		.catch((err) => {
			console.log(err);
		});
});

//
// 	MAP
//

app.get('/map', (req, res) => {
	Sensor.find({})
		.then((result) => {
			res.json({ success: true, data: result });
		})
		.catch((err) => {
			console.log(err);
		});
});

app.get('/map/token', (req, res) => {
	res.json({ success: true, key: mapKey });
});

http.listen(process.env.PORT || 3000, () => {
	console.log('Hutyra Lab Server has started on port 3000');
});
