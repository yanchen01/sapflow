const mongoose = require('mongoose');

const DataSchema = mongoose.Schema({
	batt: Number,
	snr1: Number,
	snr2: Number,
	snr3: Number,
	snr4: Number,
	teq1: Number,
	teq2: Number,
	teq3: Number,
	teq4: Number,
	time: String,
	date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Data', DataSchema);
