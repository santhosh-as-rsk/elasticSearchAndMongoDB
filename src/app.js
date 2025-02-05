import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import degreeRoutes from './routes/degreeRoutes.js';

mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/degree_db",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB connected'));

const app = express();
app.use(bodyParser.json());

app.use('/api', degreeRoutes);

export default app;
