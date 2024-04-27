const service = require("./reviews.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function reviewExists(req, res, next) {
    const { reviewId } = req.params;
    const review = await service.read(reviewId);
    if (review) {
        res.locals.reviewId = reviewId;
        res.locals.review = review;
        return next();
    }
    next({ status: 404, message: `Review cannot be found.` });
}

async function destroy(req, res) {
    const { reviewId } = res.locals;
    await service.delete(reviewId);
    res.sendStatus(204);
}

const VALID_PROPERTIES = [
    "score",
    "content"
]
function hasOnlyValidProperties(req, res,next) {
    const { data = {} } = req.body;
    const invalidFields = Object.keys(data).filter(
        (field) => !VALID_PROPERTIES.includes(field)
    );

    if (invalidFields.length) {
        return next({
            status: 400,
            message: `Invalid field(s): ${invalidFields.join(", ")}`,
        });
    }
    next();
}

async function update(req, res, next) {
    const updatedReview = {
        ...res.locals.review,
        ...req.body.data,
        review_id: res.locals.review.review_id,
      };
      const data = await service.update(updatedReview);
      res.json({ data });
}

module.exports = {
    delete: [asyncErrorBoundary(reviewExists),
    asyncErrorBoundary(destroy)],
    update: [asyncErrorBoundary(reviewExists),
    hasOnlyValidProperties,
    asyncErrorBoundary(update)]
};