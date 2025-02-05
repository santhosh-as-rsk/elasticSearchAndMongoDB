import { Degree } from '../models/Degree.js';
import syncDegreeToElastic from '../utils/elasticSync.js';
import {esClient} from '../elasticsearch.js';
import mongoose from 'mongoose';

async function createDegree(req, res)
{
	const { name, years, pgOrUg, averageSalary } = req.body;

	if (!name || !years || !pgOrUg || !averageSalary)
	{
		return res.status(400).json({ message: 'All fields (name, years, pgOrUg, averageSalary) are required.' });
	}

	if (typeof years !== 'number' || years <= 0)
	{
		return res.status(400).json({ message: 'Years must be a positive number.' });
	}

	if (typeof averageSalary !== 'number' || averageSalary < 0)
	{
		return res.status(400).json({ message: 'Average salary must be a non-negative number.' });
	}

	if (typeof name !== 'string' || name.trim() === '')
	{
		return res.status(400).json({ message: 'Name must be a non-empty string.' });
	}

	if (typeof pgOrUg !== 'string' || !['UG', 'PG'].includes(pgOrUg))
	{
		return res.status(400).json({ message: 'pgOrUg must be either "UG" or "PG".' });
	}

	try
	{
		const degree = new Degree({ name, years, pgOrUg, averageSalary });
		await degree.save();

		try
		{
			await syncDegreeToElastic(degree._id);
		} catch (esError)
		{
			console.error('Elasticsearch sync failed:', esError);
		}

		res.status(201).json(degree);
	} catch (error)
	{
		console.error('Error creating degree:', error);

		if (error.name === 'MongoNetworkError')
		{
			return res.status(500).json({ message: 'Database connection error. Please try again later.' });
		}

		res.status(400).json({ message: error.message || 'An error occurred while creating the degree.' });
	}
}


async function updateDegree(req, res)
{
	const { id } = req.params;
	const { name, years, pgOrUg, averageSalary } = req.body;

	if (!id)
	{
		return res.status(400).json({ message: 'Degree ID is required.' });
	}

	if (!mongoose.Types.ObjectId.isValid(id))
	{
		return res.status(400).json({ message: 'Invalid Degree ID format.' });
	}

	if (!name || !years || !pgOrUg || !averageSalary)
	{
		return res.status(400).json({ message: 'All fields (name, years, pgOrUg, averageSalary) are required.' });
	}

	if (typeof years !== 'number' || years <= 0)
	{
		return res.status(400).json({ message: 'Years must be a positive number.' });
	}

	if (typeof averageSalary !== 'number' || averageSalary < 0)
	{
		return res.status(400).json({ message: 'Average salary must be a non-negative number.' });
	}

	try
	{
		const degree = await Degree.findByIdAndUpdate(
			id,
			{ name, years, pgOrUg, averageSalary },
			{ new: true }
		);

		if (!degree)
		{
			return res.status(404).json({ message: `Degree with ID ${id} not found.` });
		}

		try
		{
			await syncDegreeToElastic(degree._id);
		} catch (esError) {
			console.error('ElasticSearch sync failed:', esError);
		}

		res.json(degree);
	} catch (error)
	{
		console.error('Error updating degree:', error);

		if (error.name === 'MongoNetworkError')
		{
			return res.status(500).json({ message: 'Database connection error. Please try again later.' });
		}

		res.status(400).json({ message: error.message || 'An error occurred while updating the degree.' });
	}
}


async function deleteDegree(req, res)
{
	const { id } = req.params;
	if (!id)
	{
		return res.status(400).json({ message: 'Degree ID is required.' });
	}
	if (!mongoose.Types.ObjectId.isValid(id))
	{
		return res.status(400).json({ message: 'Invalid Degree ID format.' });
	}

	try
	{
		const degree = await Degree.findByIdAndDelete(id);
		if (!degree)
		{
			return res.status(404).json({ message: `Degree with ID ${id} not found in the database.` });
		}

		try
		{
			await esClient.delete({ index: 'degrees', id });
		} catch (esError)
		{
			console.error('Elasticsearch delete error:', esError);
			return res.status(500).json({ message: `Degree ${id} deleted from MongoDB, but failed to delete from Elasticsearch.` });
		}

		res.status(204).json({ message: `Degree ${id} deleted successfully.` });
	} catch (error)
	{
		console.error('Error deleting degree:', error);

		if (error.name === 'MongoNetworkError')
		{
			return res.status(500).json({ message: 'Database connection error. Please try again later.' });
		}

		res.status(400).json({ message: error.message || 'An error occurred while deleting the degree.' });
	}
}


async function searchDegrees(req, res)
{
	const { query } = req.query;

	if (!query || query.trim().length === 0)
	{
		return res.status(400).json({ message: 'Query parameter is required and cannot be empty.' });
	}

	try {
		const { hits } = await esClient.search({
			index: 'degrees',
			body: {
				query: {
					multi_match: {
						query: query,
						fields: ['name', 'pgOrUg'],
					},
				},
			},
		});

		if (hits.total.value === 0)
		{
			return res.status(200).json({ message: 'No results found.', results: [] });
		}

		const results = hits.hits.map((hit) => hit._source);
		res.json(results);
	} catch (error)
	{
		console.error('Search error:', error);

		if (error.name === 'ConnectionError' || error.name === 'TimeoutError')
		{
			return res.status(500).json({ message: 'Elasticsearch server is not available. Please try again later.' });
		}

		res.status(400).json({ message: error.message || 'An error occurred while processing the search.' });
	}
}

export{ createDegree, updateDegree, deleteDegree, searchDegrees };