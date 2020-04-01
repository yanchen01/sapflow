const express = require('express'),
	router = express.Router({ mergeParams: true }),
	mongoose = require('mongoose');

// ------------------------------------------ //
// 			MODELS CONFIG
// ------------------------------------------ //
const Sensor = require('../models/sensor');

//
// 	CHART
//

// API for fetching data to plot chart for past 24 hrs
router.get('/', (req, res) => {
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
router.get('/week', (req, res) => {
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

module.exports = router;
