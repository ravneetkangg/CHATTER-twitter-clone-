// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('colors');

const dbConnect = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const tweetRoutes = require('./routes/tweetRoutes');
const likeRoutes = require('./routes/likeRoutes');

const app = express();
const PORT = 4900;

app.use(express.json());
dbConnect();

app.use(cors());
app.use('/api/users', userRoutes);
app.use('/api/tweets', tweetRoutes);
app.use('/api/likes', likeRoutes);

app.get('/', (req, res) => {
    res.send("Hello, World!");
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`.green.bold);
});