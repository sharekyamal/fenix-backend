const express = require('express');
const app = express();

// Sample data with video URLs
const series = [
  {
    id: 1,
    title: "Love Story",
    image: "https://android.momoclips.com/images/21288_video_thumb.png",
    type: "series",
    videoUrl: "https://example.com/videos/love-story-ep1.mp4" // ဒီမှာ video URL ထည့်ပေးပါ
  },
  {
    id: 2,
    title: "Love Story",
    image: "https://android.momoclips.com/images/21288_video_thumb.png",
    type: "series",
    videoUrl: "https://example.com/videos/love-story-ep2.mp4"
  },
  {
    id: 3,
    title: "Love Story",
    image: "https://android.momoclips.com/images/21288_video_thumb.png",
    type: "series",
    videoUrl: "https://example.com/videos/love-story-ep3.mp4"
  }
];

const movies = [
  {
    id: 1,
    title: "Movie 1",
    image: "https://android.momoclips.com/images/21288_video_thumb.png",
    type: "movie",
    videoUrl: "https://example.com/videos/movie1.mp4"
  }
];

app.get('/api/series', (req, res) => {
  res.json(series);
});

app.get('/api/movies', (req, res) => {
  res.json(movies);
});

app.get('/api/series/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const serie = series.find(s => s.id === id);
  if (serie) {
    res.json(serie);
  } else {
    res.status(404).json({ message: 'Series not found' });
  }
});

app.get('/api/movies/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const movie = movies.find(m => m.id === id);
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).json({ message: 'Movie not found' });
  }
});

// Episodes endpoint ထည့်ပေးပါ
const episodes = {
  1: [
    { id: 1, title: "Episode 1", videoUrl: "https://example.com/videos/love-story-ep1.mp4" },
    { id: 2, title: "Episode 2", videoUrl: "https://example.com/videos/love-story-ep2.mp4" }
  ],
  2: [
    { id: 1, title: "Episode 1", videoUrl: "https://example.com/videos/love-story-2-ep1.mp4" }
  ],
  3: [
    { id: 1, title: "Episode 1", videoUrl: "https://example.com/videos/love-story-3-ep1.mp4" }
  ]
};

app.get('/api/series/:id/episodes', (req, res) => {
  const id = parseInt(req.params.id);
  const seriesEpisodes = episodes[id] || [];
  res.json(seriesEpisodes);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
