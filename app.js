const express = require('express'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	seedDB = require('./seeds'),
	parseDate = require('./parseData'),
	axios = require('axios');

const app = express();

// ------------------------------------------ //
// 			MONGOOSE CONFIGURATION
// ------------------------------------------ //
require('dotenv').config();
const Mongo_URI = process.env.ATLAS_URI;
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

// SHOW - information about a sensor
app.get('/sensor/:dev_id', (req, res) => {
	Sensor.find({ dev_id: req.params.dev_id })
		.then((sensorDoc) => {
			console.log(sensorDoc);
			// res.render('./sensors/show');
			res.send(sensorDoc);
		})
		.catch((err) => {
			console.log(err);
		});
});

// POST - collect data from sensor
app.post('/sensor', (req, res) => {
	const sensorData = {
		app_id: req.body.app_id,
		dev_id: req.body.dev_id,
		hardware_serial: req.body.hardware_serial,
		batt: req.body.payload_fields.batt,
		snr1: req.body.payload_fields.snr1,
		snr2: req.body.payload_fields.snr2,
		snr3: req.body.payload_fields.snr3,
		snr4: req.body.payload_fields.snr4,
		teq1: req.body.payload_fields.teq1,
		teq2: req.body.payload_fields.teq2,
		teq3: req.body.payload_fields.teq3,
		teq4: req.body.payload_fields.teq4,
		time: req.body.metadata.time,
		downlink_url: req.body.downlink_url
	};

	/* 	Sensor.findOneAndUpdate({ dev_id: sensorData.dev_id }, sensorData).then((doc) => {}).catch((err) => {
		console.log(err);
	});

	Sensor.findOne({ dev_id: sensorData.dev_id })
		.then((sensor) => {
			console.log(sensor);
			if (sensor === null) {
				Sensor.create(sensorData, (err, result) => {
					if (err) {
						console.log(err);
					} else {
						console.log('Creating new sensor: ');
						console.log(result);
						res.send('Created');
					}
				});
			} else {
				res.send('Updated');
			}
		})
		.catch((err) => {
			console.log(err);
		}); */
	Sensor.create(sensorData, (err, result) => {
		if (err) {
			console.log(err);
		} else {
			console.log('Creating new sensor: ');
			console.log(result);
			res.send('Created');
		}
	});
});

// seedDB(); // seed the database
parseDate();
app.listen(process.env.PORT || 3000, () => {
	console.log('Hutyra Lab Server has started on port 3000');
});
