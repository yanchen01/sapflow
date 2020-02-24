const mongoose = require('mongoose'),
	Sensor = require('./models/sensor'),
	moment = require('moment');

function SNR_Day() {
	const currentTime = moment.utc();
	const parseTime = moment.utc().subtract(1, 'weeks'); // parse from last week
	// console.log(`Now: ${currentTime} Parse: ${parseTime}`);
	//console.log(`Now: ${currentTime.toString()} Parse: ${parseTime.toString()}`);

	const query = Sensor.find({
		time: {
			$gte: parseTime,
			$lte: currentTime
		}
	}).then((data) => {
		console.log(data);
	});


	return query;
}

module.exports = SNR_Day;
