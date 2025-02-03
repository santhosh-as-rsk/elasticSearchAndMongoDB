const mongoose = require('mongoose');

const degreeSchema = new mongoose.Schema({
	name: { type: String, required: true },
	years: { type: Number, required: true },
	pgOrUg: { type: String, required: true },
	averageSalary: { type: Number, required: true }
});

const Degree = mongoose.model('Degree', degreeSchema);
module.exports = Degree;
