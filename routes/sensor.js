const express = require('express'),
	router = express.Router({ mergeParams: true }),
	mongoose = require('mongoose'),
	passport = require('passport'),
	stringify = require('csv-stringify'),
	middleware = require('../middleware/index');

const app = express();

// ------------------------------------------ //
// 			MODELS CONFIG
// ------------------------------------------ //
const Sensor = require('../models/sensor');

// ------------------------------------------ //
// 			SOCKET.IO CONFIGURATION
// ------------------------------------------ //
const http = require('http').createServer(app);
const io = require('socket.io')(http);

//
// 	SENSOR
//

// GET - see all sensor data
router.get('/', middleware.isLoggedIn, (req, res) => {
	let dev_id = [];
	// find all docs and filter out unique doc for a sensor
	Sensor.find({})
		.then((resultArr) => {
			let sensorArr = resultArr.filter((sensor) => {
				if (!dev_id.includes(sensor.dev_id)) {
					dev_id.push(sensor.dev_id);
					return true;
				} else {
					return false;
				}
			});

			console.log(sensorArr);
			res.render('./sensors/index', { sensorArr: sensorArr, currentUser: req.user });
		})
		.catch((err) => {
			console.log(err);
		});
});

// POST - collect data from sensor
router.post('/', (req, res) => {
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
/* 		lat: req.body.payload_fields.lat,
		long: req.body.payload_fields.long, */
		time: req.body.metadata.time
	};

/* 	new Sensor(sensorData)
		.save()
		.then((sensor) => {
			io.emit('update', true);
			console.log('emit new update');
			return res.json('success');
		})
		.catch((err) => {
			console.log(err);
		}); */
	Sensor.create(sensorData, function (err, result) {
		if (err) {
			console.log(err);
		}
		io.emit('update', true);
		console.log('emit new update');
		return res.json('success');
	})
});

// SHOW - information about a sensor
router.get('/:dev_id', middleware.isLoggedIn, (req, res) => {
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

// EDIT - edit the sensor document fields
router.get('/:dev_id/edit', middleware.isLoggedIn, (req, res) => {
	let doc = {dev_id: req.params.dev_id};
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

// UPDATE - update sensor collection
router.put('/:dev_id', (req, res) => {
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

// DELETE - delete a sensor documents
router.delete('/:dev_id', middleware.isLoggedIn, (req, res) => {
	Sensor.deleteMany({ dev_id: req.params.dev_id })
		.then((result) => {
			req.flash('success', 'Sensor Deleted');
			res.redirect('/sensor');
		})
		.catch((err) => {
			req.flash('error', err);
			console.log(err);
		});
});

router.get('/:dev_id/download', middleware.isLoggedIn, (req, res) => {
	let doc = {};
	// find the updated static fields
	Sensor.find({ dev_id: req.params.dev_id })
		.then((sensorArr) => {
			doc = sensorArr.find(
				(element) =>
					element.lat != undefined &&
					element.long != undefined &&
					element.forest != undefined &&
					element.tree_id != undefined &&
					element.species != undefined
			);

			const currentTime = new Date().toISOString();
			let parseTime = new Date().setDate(new Date().getDate() - 1); // parse from last 24 hrs
			parseTime = new Date(parseTime).toISOString();

			Sensor.updateMany(
				{
					dev_id: req.params.dev_id,
					date: {
						$gte: parseTime,
						$lte: currentTime
					}
				},
				{
					lat: doc.lat,
					long: doc.long,
					forest: doc.forest,
					tree_id: doc.tree_id,
					species: doc.species
				}
			)
				.then((data) => {
					console.log('Updated downloading docs');
					Sensor.find({
						dev_id: req.params.dev_id,
						date: {
							$gte: parseTime,
							$lte: currentTime
						}
					})
						.then((sensorArr) => {
							// adding appropriate headers, so browsers can start downloading
							// file as soon as this request starts to get served
							res.setHeader('Content-Type', 'text/csv');
							res.setHeader(
								'Content-Disposition',
								'attachment; filename="' + req.params.dev_id + '_day_' + Date.now() + '.csv"'
							);
							res.setHeader('Cache-Control', 'no-cache');
							res.setHeader('Pragma', 'no-cache');

							// stringify return a readable stream, that can be directly piped
							// to a writeable stream which is "res" (the response object from express.js)
							// since res is an abstraction over node http's response object which supports "streams"
							stringify(sensorArr, {
								header: true,
								columns: [
									'_id',
									'app_id',
									'dev_id',
									'hardware_serial',
									'downlink_url',
									'batt',
									'snr1',
									'snr2',
									'snr3',
									'snr4',
									'teq1',
									'teq2',
									'teq3',
									'teq4',
									'time',
									'date',
									'__v',
									'forest',
									'lat',
									'long',
									'species',
									'tree_id'
								]
							}).pipe(res);
						})
						.catch((err) => {
							console.log(err);
						});
				})
				.catch((err) => {
					console.log(err);
				});
		})
		.catch((err) => {
			console.log(err);
		});
});

router.get('/:dev_id/download/week', middleware.isLoggedIn, (req, res) => {
	let doc = {};
	// find the updated static fields
	Sensor.find({ dev_id: req.params.dev_id })
		.then((sensorArr) => {
			doc = sensorArr.find(
				(element) =>
					element.lat != undefined &&
					element.long != undefined &&
					element.forest != undefined &&
					element.tree_id != undefined &&
					element.species != undefined
			);

			const currentTime = new Date().toISOString();
			let parseTime = new Date().setDate(new Date().getDate() - 7); // parse from past week
			parseTime = new Date(parseTime).toISOString();

			Sensor.updateMany(
				{
					dev_id: req.params.dev_id,
					date: {
						$gte: parseTime,
						$lte: currentTime
					}
				},
				{
					lat: doc.lat,
					long: doc.long,
					forest: doc.forest,
					tree_id: doc.tree_id,
					species: doc.species
				}
			)
				.then((data) => {
					console.log('Updated downloading docs');
					Sensor.find({
						dev_id: req.params.dev_id,
						date: {
							$gte: parseTime,
							$lte: currentTime
						}
					})
						.then((sensorArr) => {
							// adding appropriate headers, so browsers can start downloading
							// file as soon as this request starts to get served
							res.setHeader('Content-Type', 'text/csv');
							res.setHeader(
								'Content-Disposition',
								'attachment; filename="' + req.params.dev_id + '_week_' + Date.now() + '.csv"'
							);
							res.setHeader('Cache-Control', 'no-cache');
							res.setHeader('Pragma', 'no-cache');

							// stringify return a readable stream, that can be directly piped
							// to a writeable stream which is "res" (the response object from express.js)
							// since res is an abstraction over node http's response object which supports "streams"
							stringify(sensorArr, {
								header: true,
								columns: [
									'_id',
									'app_id',
									'dev_id',
									'hardware_serial',
									'downlink_url',
									'batt',
									'snr1',
									'snr2',
									'snr3',
									'snr4',
									'teq1',
									'teq2',
									'teq3',
									'teq4',
									'time',
									'date',
									'__v',
									'forest',
									'lat',
									'long',
									'species',
									'tree_id'
								]
							}).pipe(res);
						})
						.catch((err) => {
							console.log(err);
						});
				})
				.catch((err) => {
					console.log(err);
				});
		})
		.catch((err) => {
			console.log(err);
		});
});

module.exports = router;
