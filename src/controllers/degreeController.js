const Degree = require('../models/Degree');
const syncDegreeToElastic = require('../utils/elasticSync');
const esClient = require('../elasticsearch');

async function createDegree(req, res)
{
	const { name, years, pgOrUg, averageSalary } = req.body;

	try
	{
		const degree = new Degree({ name, years, pgOrUg, averageSalary });
		await degree.save();
		await syncDegreeToElastic(degree._id);
		res.status(201).json(degree);
	} catch (error)
	{
		res.status(400).json({ message: error.message });
	}
}

async function updateDegree(req, res)
{
	const { id } = req.params;
	const { name, years, pgOrUg, averageSalary } = req.body;

	try
	{
		const degree = await Degree.findByIdAndUpdate(
			id,
			{ name, years, pgOrUg, averageSalary },
			{ new: true }
		);
		await syncDegreeToElastic(degree._id);
		res.json(degree);
	} catch (error)
	{
		res.status(400).json({ message: error.message });
	}
}

async function deleteDegree(req, res)
{
	const { id } = req.params;

	try
	{
		await Degree.findByIdAndDelete(id);
		await esClient.delete({ index: 'degrees', id });
		res.status(204).json({ message: `Degree ${id} deleted successfully`});
	} catch (error)
	{
		res.status(400).json({ message: error.message });
	}
}

async function searchDegrees(req, res)
{
	const { query } = req.query;
	try
	{
		const { hits } = await esClient.search(
			{
				index: 'degrees',
				body: {
					query: {
					multi_match: {
						query: query,
						fields: ['name', 'pgOrUg']
					}
					}
				}
			}
		);

		const results = hits.hits.map(hit => hit._source);
		res.json(results);
	} catch (error)
	{
		console.error('Search error:', error);
		res.status(400).json({ message: error.message });
	}
}

module.exports = { createDegree, updateDegree, deleteDegree, searchDegrees };
