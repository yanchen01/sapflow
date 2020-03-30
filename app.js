const express = require('express'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	mongoose = require('mongoose');

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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
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
			res.json({ success: true, data: data });
		})
		.catch((err) => {
			console.log(err);
		});
});

// GET - see all sensor data
app.get('/sensor', (req, res) => {
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
						long: result[i].long,
						lat: result[i].lat
					};
					dev_id.push(result[i].dev_id);
					sensorArr.push(sensor);
				}
			}
			console.log('Before render');
			console.log(sensorArr);
			res.render('./sensors/index', { sensorArr: sensorArr });
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
app.get('/sensor/:dev_id/edit', (req, res) => {
	Sensor.find({ dev_id: req.params.dev_id })
		.then((sensorArr) => {
			res.render('./sensors/edit', { sensor: sensorArr.slice(-1)[0] });
		})
		.catch((err) => {
			console.log(err);
		});
});

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
