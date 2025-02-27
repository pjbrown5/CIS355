//app.js sets up the express server, defines routes, middleware, and integrates handlebars
//Some lines in here and in the rest of the files are from chatgpt to help debug. Most of them are logging statements to diagnose a problem.


const express = require("express");
const exphbs = require("express-handlebars");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

const movieRoutes = require("./routes/movies");
const MOVIES_FILE = path.join(__dirname, "data", "movies.json");

fs.access(MOVIES_FILE, fs.constants.W_OK, (err) => {
    if (err) {
        console.error("No write permission for movies.json:", err);
    } else {
        console.log("movies.json is writable");
    }
});

// Reads the movies.json file
function readMovies(){
    if(!fs.existsSync(MOVIES_FILE)){
        writeMovies([]);
        return [];
    }

    const data = fs.readFileSync(MOVIES_FILE, "utf8");
    return JSON.parse(data);
}

// Writes movies array to movies.json
function writeMovies(movies){
    fs.writeFileSync(MOVIES_FILE, JSON.stringify(movies, null, 2), "utf8");
}

//Everything down to app.set is from chatgpt. Honestly not really sure what it does. 
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/movies", movieRoutes);

app.engine("hbs", exphbs.engine({ extname: "hbs", defaultLayout: "main" }));
app.set("view engine", "hbs");

//Renders index.hbs 
app.get("/", (req, res) => {
    const movies = readMovies();
    console.log("All movies:", movies);
    const unwatched = movies.filter(movie => !movie.watched);
    console.log("Unwatched movies:", unwatched);
    res.render("index", { title: "Movie Watchlist", movies: unwatched });
});

// Watched movies page
app.get("/watched", (req, res) => {
    const movies = readMovies().filter(movie => movie.watched);
    res.render("watched", { title: "Watched Movies", movies });
});

// Movie detail page
app.get("/movies/:id", (req, res) => {
    const movies = readMovies();
    const movie = movies.find(m => m.id == parseInt(req.params.id));
    if (!movie) {
        return res.status(404).render("404", { message: "Movie not found" });
    }
    res.render("movie", { title: movie.title, movie });
});


app.use((err, req, res, next) => {
    console.error("Error:", err.stack);
    res.status(500).render("error", { message: "Something went wrong!" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Post movies route. Handles form submission and updates movies.json
app.post("/movies", (req, res) => {
    const { title, year } = req.body;
    const movies = readMovies();

    console.log("Received POST request to add movie:", { title, year });


    const newMovie = {
        id: movies.length + 1,
        title, 
        year, 
        watched: false,
        rating: null, 
        review: null,
    };

    movies.push(newMovie);
    writeMovies(movies);

    res.status(201).json(newMovie);
});

// mark as watched function
app.put("/movies/:id/watched", (req, res) => {
    const movies = readMovies();
    const movieId = parseInt(req.params.id);

    const movie = movies.find(m => m.id === movieId);
    if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
    }

    movie.watched = true;

    writeMovies(movies);
    res.json({ message: "Movie marked as watched", movie });
});

//Delete function
app.delete("/movies/:id", (req, res) => {
    const movieId = parseInt(req.params.id, 10);
    let movies = readMovies();

    console.log("Received DELETE request for movie ID:", movieId);

    movies = movies.filter((m) => m.id !== movieId);

    console.log("Movies after delete:", movies);

    fs.writeFileSync(MOVIES_FILE, JSON.stringify(movies, null, 2));

    res.status(200).send("Movie deleted");
});

//Route handles rating and review submission
app.put("/movies/:id/review", (req, res) => {
    const movieId = parseInt(req.params.id, 10);
    const { rating, review } = req.body;
    const movies = readMovies();
    const movie = movies.find((m) => m.id === movieId);

    if (movie) {
        movie.rating = rating;
        movie.review = review;
        writeMovies(movies);
        res.status(200).json(movie);
    } else {
        res.status(404).send("Movie not found");
    }
});




