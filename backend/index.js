// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('colors');

const dbConnect = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const tweetRoutes = require('./routes/tweetRoutes');

const app = express();
const PORT = 4900;

app.use(express.json());
dbConnect();

app.use(cors());
app.use('/api/users', userRoutes);
app.use('/api/tweets', tweetRoutes);

app.get('/', (req, res) => {
    res.send("Hello, World!");
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`.green.bold);
});