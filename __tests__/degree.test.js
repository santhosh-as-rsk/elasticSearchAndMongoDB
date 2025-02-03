const request = require('supertest');
const app = require('../src/app');

describe('Degree API', () =>
{
	let degreeId;

	it('should create a new degree', async () =>
	{
		const degreeData = {
			name: 'Computer Science',
			years: 4,
			pgOrUg: 'UG',
			averageSalary: 60000,
		};

		const res = await request(app)
			.post('/api/degrees')
			.send(degreeData);

		expect(res.status).toBe(201);
		expect(res.body.name).toBe('Computer Science');
		expect(res.body.years).toBe(4);
		expect(res.body.pgOrUg).toBe('UG');
		expect(res.body.averageSalary).toBe(60000);

		degreeId = res.body._id;
	});

	it('should search degrees by name', async () =>
	{
		const res = await request(app)
			.get('/api/degrees/search')
			.query({ query: 'Computer' });

		expect(res.status).toBe(200);
		expect(res.body.length).toBeGreaterThan(0);
		expect(res.body[0].name).toBe('Computer Science');
	});

	it('should update an existing degree', async () =>
	{
		const updatedData = {
			name: 'Computer Science',
			years: 5,
			pgOrUg: 'UG',
			averageSalary: 70000,
		};

		const res = await request(app)
			.put(`/api/degrees/${degreeId}`)
			.send(updatedData);

		expect(res.status).toBe(200);
		expect(res.body.name).toBe('Computer Science');
		expect(res.body.years).toBe(5);
		expect(res.body.averageSalary).toBe(70000);
	});

	it('should delete a degree', async () =>
	{
		const degreeData = {
			name: 'Computer Science',
			years: 4,
			pgOrUg: 'UG',
			averageSalary: 60000,
		};
	
		const createRes = await request(app)
			.post('/api/degrees')
			.send(degreeData);
		
		const degreeId = createRes.body._id;
		
		const res = await request(app).delete(`/api/degrees/${degreeId}`);
		
		expect(res.status).toBe(204);
		
		const deletedRes = await request(app).get(`/api/degrees/${degreeId}`);
		expect(deletedRes.status).toBe(404);
	});
	
});
