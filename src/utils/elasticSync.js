const esClient = require('../elasticsearch');
const Degree = require('../models/Degree');

async function syncDegreeToElastic(degreeId) {
	try {
		const degree = await Degree.findById(degreeId);
		if (!degree) {
			console.log('Degree not found');
			return;
		}

		await esClient.index({
			index: 'degrees',
			id: degree._id.toString(),
			body: {
				name: degree.name,
				years: degree.years,
				pgOrUg: degree.pgOrUg,
				averageSalary: degree.averageSalary,
			},
		});
		console.log('Degree synced to Elasticsearch');
	} catch (error) {
		console.error('Error syncing degree to Elasticsearch:', error);
	}
}

module.exports = syncDegreeToElastic;
