const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const degreeRoutes = require('./routes/degreeRoutes');
require('dotenv').config();

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

module.exports = app;
