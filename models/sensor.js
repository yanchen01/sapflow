const mongoose = require('mongoose');

const SensorSchema = mongoose.Schema({
    app_id: String,
    dev_id: String,
    hardware_serial: String,
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
    downlink_url: String
});

module.exports = mongoose.model('Sensor', SensorSchema);