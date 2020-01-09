let middleware = require('../util/middleware.js');

module.exports = (app) => {
    const participation = require('../controllers/participationTut.controller.js');

    // Create a new participation
    app.post('/tparticipations', middleware.checkToken, participation.create);

    // Retrieve all participations
    app.get('/tparticipations', middleware.checkTokenAdmin, participation.findAll);
    
    // Retrieve all participations per contestId in body
    // app.post('/tparticipations/all', middleware.checkToken, participation.findContestPart);

    // Retrieve all participations for user in a contest
    app.get('/tparticipations/:contestId', middleware.checkToken, participation.findUser);
}