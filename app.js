const express = require('express'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	seedDB = require('./seeds'),
	axios = require('axios');

const app = express();

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

/* // middleware
const parseDay = require('./parseData');
const objArr = parseDay();
console.log(objArr); */

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
	// get all trees and pass into index
	Tree.find({})
		.then((trees) => {
			res.render('index', { trees });
		})
		.catch((err) => {
			console.log(err);
		});
});

// SHOW - information about a tree
app.get('/tree/:id', (req, res) => {
	Tree.findById(req.params.id)
		.then((tree) => {
			res.render('./trees/show', { tree });
		})
		.catch((err) => {
			console.log(err);
		});
});

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
			console.log(data);
			res.json({ success: true, data: data });
		})
		.catch((err) => {
			console.log(err);
		});
});

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
			console.log(data);
			res.json({ success: true, data: data });
		})
		.catch((err) => {
			console.log(err);
		});
});

// GET - see all sensor data
app.get('/sensor', (req, res) => {
	res.render('./sensors/index');
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
			return res.json('success');
		})
		.catch((err) => {
			console.log(err);
		});
});

// SHOW - information about a sensor
app.get('/sensor/:dev_id', (req, res) => {
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
			console.log(data);
			res.render('./sensors/show', { sensor: data[0] });
		})
		.catch((err) => {
			console.log(err);
		});

	/* 	Sensor.find({ dev_id: req.params.dev_id })
		// return an array of sensors
		// correct sensor is always first element of the array
		.then((sensorArr) => {
			console.log(sensorArr[0]);
			let dataObjArray = [];

			sensorArr[0].data.forEach((dataID) => {
				Data.find({
					_id: dataID,
					date: {
						$gte: parseTime,
						$lte: currentTime
					}
				})
					.then((result) => {
						// console.log(result[0]);
						if (result[0] !== undefined) {
							const dataObj = {
								date: result[0].date,
								batt: result[0].batt,
								snr1: result[0].snr1,
								snr2: result[0].snr2,
								snr3: result[0].snr3,
								snr4: result[0].snr4,
								teq1: result[0].teq1,
								teq2: result[0].teq2,
								teq3: result[0].teq3,
								teq4: result[0].teq4
							};
							// append the obj to array
							dataObjArray.push(dataObj);
							dataObjArray.forEach((obj) => {
								console.log(obj);
							});
							console.log('pushed');
						}
					})
					.catch((err) => {
						console.log(err);
					});
			});
			console.log('rendering');
			dataObjArray.forEach((obj) => {
				console.log(obj);
			});
			res.render('./sensors/show');
		})
		.catch((err) => {
			console.log(err);
		}); */
});

app.get('/map', (req, res) => {
	Sensor.find({})
		.then((result) => {
			console.log(result);
			res.json({ success: true, data: result });
		})
		.catch((err) => {
			console.log(err);
		});
});

app.get('/map/token', (req, res) => {
	res.json({ success: true, key: mapKey });
});

// seedDB(); // seed the database
app.listen(process.env.PORT || 3000, () => {
	console.log('Hutyra Lab Server has started on port 3000');
});
