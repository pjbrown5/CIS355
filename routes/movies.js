// Defines API endpoints for CRUD ops

const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const dataFile = path.join(__dirname, "../data/movies.json");

const moviesFilePath = path.join(__dirname, "../data/movies.json");

const readMovies = () => {
    try{
        const data = fs.readFileSync(dataFile, "utf-8");
        return JSON.parse(data);
    } catch (err){
        console.error("Error reading movie data:", err);
        return[];
    }
};

const saveMovies = (movies) => {
    fs.writeFileSync(moviesFilePath, JSON.stringify(movies, null, 2), "utf-8");
};

const writeMovies = (movies) => {
    try {
        fs.writeFileSync(moviesFilePath, JSON.stringify(movies, null, 2), "utf-8");
        console.log("Movies written to file successfully");
    } catch (err) {
        console.error("Error writing movies:", err);
    }
};

router.get("/",(req, res) => {
    const movies = readMovies();
    res.json(movies);
});

router.post("/", (req, res) => {
    const movies = readMovies();
    const { title, year, watched, rating, review, } = req.body;

    if (!title || !year){
        return res.status(400).json({ error: "Title and Year are required."});
    }

    const newMovie = {
        id: movies.length + 1,
        title, 
        year, 
        watched: watched || false,
        rating: rating || null,
        review: review || "",
    };

    movies.push(newMovie);
    writeMovies(movies);

    res.status(201).json(newMovie);
});


router.put("/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    console.log(`Received update request for movie ID: ${id}`);
    console.log("Update data:", updates);

    let movies = readMovies();
    let movieIndex = movies.findIndex(movie => movie.id == id);

    if (movieIndex === -1) {
        console.log("Movie not found.");
        return res.status(404).json({ error: "Movie not found." });
    }

    try {
        movies[movieIndex] = { ...movies[movieIndex], ...updates };

        saveMovies(movies);

        console.log("Updated movie:", movies[movieIndex]);
        res.json(movies[movieIndex]);
    } catch (error) {
        console.error("Error updating movie:", error);
        res.status(500).json({ error: "Failed to update movie." });
    }
});



router.delete("/:id", (req, res) => {
    let movies = readMovies();
    const movieId = parseInt(req.params.id);

    const filteredMovies = movies.filter((m) => m.id !== movieId);
    if (filteredMovies.length === movies.length) {
        return res.status(404).json({ error: "Movies not found."});
    }

    writeMovies(filteredMovies);
    res.status(204).send();
});

module.exports = router;