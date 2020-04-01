const express = require('express'),
	router = express.Router({ mergeParams: true }),
	mongoose = require('mongoose');

// ------------------------------------------ //
// 			MODELS CONFIG
// ------------------------------------------ //
const Sensor = require('../models/sensor');

require('dotenv').config();
const mapKey = process.env.mapKey;

//
// 	MAP
//

router.get('/', (req, res) => {
	Sensor.find({})
		.then((result) => {
			res.json({ success: true, data: result });
		})
		.catch((err) => {
			console.log(err);
		});
});

router.get('/token', (req, res) => {
	res.json({ success: true, key: mapKey });
});

module.exports = router;
