const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Admin credentials (hardcoded for simplicity)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies

// Path to the data file
const dataFilePath = path.join(__dirname, 'data.json');

// Helper function to read data from JSON file
const readData = async () => {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { series: {}, movies: {} };
  }
};

// Helper function to write data to JSON file
const writeData = async (data) => {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
    throw error;
  }
};

// Middleware to check admin authentication
const checkAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii').split(':');
  const username = credentials[0];
  const password = credentials[1];
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// API Endpoints

// Get all series
app.get('/api/series', async (req, res) => {
  const data = await readData();
  const seriesList = Object.keys(data.series).map(id => ({
    id: parseInt(id),
    title: data.series[id][0].seriesTitle,
    image: data.series[id][0].image,
    type: 'series',
  }));
  res.json(seriesList);
});

// Get all movies
app.get('/api/movies', async (req, res) => {
  const data = await readData();
  const moviesList = Object.keys(data.movies).map(id => ({
    id: parseInt(id),
    title: data.movies[id][0].title,
    image: data.movies[id][0].image,
    type: 'movie',
  }));
  res.json(moviesList);
});

// Get content by ID (for episodes or movie)
app.get('/api/content/:id', async (req, res) => {
  const contentId = parseInt(req.params.id);
  const data = await readData();

  if (data.series[contentId]) {
    res.json({
      type: 'series',
      title: data.series[contentId][0].seriesTitle,
      episodes: data.series[contentId],
    });
  } else if (data.movies[contentId]) {
    res.json({
      type: 'movie',
      title: data.movies[contentId][0].title,
      movie: data.movies[contentId][0],
    });
  } else {
    res.status(404).json({ error: 'Content not found' });
  }
});

// Add a new series (admin only)
app.post('/api/series', checkAuth, async (req, res) => {
  const { seriesTitle, image, episodes } = req.body;
  if (!seriesTitle || !image || !episodes || !Array.isArray(episodes)) {
    return res.status(400).json({ error: 'Invalid series data' });
  }

  const data = await readData();
  const newId = Math.max(...Object.keys(data.series).map(Number), ...Object.keys(data.movies).map(Number), 0) + 1;

  data.series[newId] = episodes.map(episode => ({
    seriesTitle,
    image,
    title: episode.title,
    url: episode.url,
  }));

  await writeData(data);
  res.status(201).json({ id: newId, message: 'Series added successfully' });
});

// Add a new movie (admin only)
app.post('/api/movies', checkAuth, async (req, res) => {
  const { title, image, url } = req.body;
  if (!title || !image || !url) {
    return res.status(400).json({ error: 'Invalid movie data' });
  }

  const data = await readData();
  const newId = Math.max(...Object.keys(data.series).map(Number), ...Object.keys(data.movies).map(Number), 0) + 1;

  data.movies[newId] = [{ title, image, url }];

  await writeData(data);
  res.status(201).json({ id: newId, message: 'Movie added successfully' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});