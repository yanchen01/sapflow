const mongoose = require('mongoose');

const SensorSchema = mongoose.Schema({
	app_id: String,
	dev_id: String,
	hardware_serial: String,
	data: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Data'
		}
	],
	downlink_url: String
});

module.exports = mongoose.model('Sensor', SensorSchema);
