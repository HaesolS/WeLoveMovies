const service = require("./movies.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res) {
    if (req.query.is_showing === 'true') {
        const data = await service.moviesShowing();
        return res.json({
            data
        });
    }
    const data = await service.list();
    res.json({
        data,
    });
}

async function movieExists(req, res, next) {
    const { movieId } = req.params;
    const movie = await service.read(movieId);
    if (movie) {
        res.locals.movieId = movieId;
        res.locals.foundMovie = movie;
        return next();
    }
    next({ status: 404, message: `Movie cannot be found.` });
}

async function read(req, res, next) {
    const data = res.locals.foundMovie;
    res.json({
        data
    });
}

async function listTheatersPlayingMovie(req, res, next) {
    const { movieId } = req.params;
    const data = await service.listTheatersPlayingMovie(movieId);
    res.json({
        data
    });
}

async function listMovieReviews(req, res) {
    const { movieId } = req.params;
    const data = await service.listMovieReviews(movieId);
    res.json({
        data
    });
}

module.exports = {
    list: asyncErrorBoundary(list),
    read: [asyncErrorBoundary(movieExists), read],
    listTheatersPlayingMovie: [
        asyncErrorBoundary(movieExists),
        asyncErrorBoundary(listTheatersPlayingMovie)
    ],
    listMovieReviews: [
        asyncErrorBoundary(movieExists),
        asyncErrorBoundary(listMovieReviews)
    ]
};