const mongoose = require('mongoose');

const TreeSchema = mongoose.Schema({
    forest: String,
    name: String,
    hpv10: Number,
    hpv20: Number,
    hpv35: Number,
    hpv50: Number,
    batt: Number,
    time: String
});

module.exports = mongoose.model('Tree', TreeSchema);
