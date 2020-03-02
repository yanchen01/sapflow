const mongoose = require('mongoose'),
	Sensor = require('./models/sensor'),
	Data = require('./models/data'),
	moment = require('moment');
let dataObjArray = [];

function parseDay() {
	const currentTime = new Date().toISOString();
	let parseTime = new Date().setDate(new Date().getDate() - 1); // parse from last 24 hrs
	parseTime = new Date(parseTime).toISOString();
	console.log(`Now: ${currentTime} Parse: ${parseTime}`);
	console.log(`Now: ${currentTime.toString()} Parse: ${parseTime.toString()}`);

	Sensor.find()
		.then((sensorArr) => {
			sensorArr.forEach((sensor) => {
				// console.log(sensor.data);
				sensor.data.forEach((dataID) => {
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
								// append the obj to array
								dataObjArray.push({
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
								});
							}
						})
						.catch((err) => {
							console.log(err);
						});
				});
			});
		})
		.catch((err) => {
			console.log(err);
		});
	console.log('return here');
	dataObjArray.forEach((data) => {
		console.log(data);
	});
	// return an array containing all data objects to be plotted
	return dataObjArray;
}

module.exports = parseDay;
