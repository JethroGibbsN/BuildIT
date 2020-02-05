const Participation = require('../models/participationTut.model.js');
const inarray = require('inarray');

var moment = require('moment');
// Create and Save a new participation
exports.create = (req, res) => {
    req.body.username = req.decoded.username;
    // Validate request
    if(!req.body.username) {
        return res.status(400).send({
            success: false,
            message: "user Id can not be empty"
        });
    }

    if(!req.body.courseId) {
        return res.status(400).send({
            success: false,
            message: "course Id can not be empty"
        });
    }
    
    Participation.find({participationId: req.body.username + req.body.courseId})
    .then(participation => {
        if (participation.length === 0){
                // Create a Participation
                const participation = new Participation({
                    participationId: req.body.username + req.body.courseId,
                    username: req.body.username,
                    courseId: req.body.courseId,
                    submissionResults: [],
                    easySolved: [],
                    mediumSolved: [],
                    hardSolved: []
                });
                // Save participation in the database
                participation.save()
                .then(data => {
                    res.send(data);
                }).catch(err => {
                    res.status(500).send({
                        success: false,
                        message: err.message || "Some error occurred while Registering."
                    });
                });
            
        } else {
            res.send({success: false, message: "User already participated"});

        }
    }).catch(err => {
        res.status(500).send({
            success: false,
            message: err.message || "Some error occurred while retrieving participation."
        });
    });

    
};

// add sol to participation
exports.acceptSubmission = (sub, callback) => {
    // Change here
    // Find participation and update it with the request body
    Participation.find({participationId: sub.participationId})
    .then(participation => {
        // Check prev sub
            participation = participation[0];
            found = false;
            updated = false;
            
            if (participation.submissionResults.length !== 0){
            for (let i = 0; i < participation.submissionResults.length; i++){
                if (participation.submissionResults[i].questionId === sub.questionId){
                    found = true;
                    if (participation.submissionResults[i].score < sub.score){
                        // Update higher score
                        updated = true;
                        console.log("Came here");
                        Participation.updateOne({participationId: sub.participationId, "submissionResults.questionId": sub.questionId}, {$set:
                            {"submissionResults.$.score": sub.score, "submissionResults.$.language": sub.language, "submissionResults.$.difficulty": sub.difficulty}
                          }, {new: true}, (err, doc) => {
                            if (err) {
                                console.log("Something wrong when updating data!");
                            }
                            // console.log(doc);
                          })
                        .then(participation => {
                            if(!participation) {
                                return callback("Participation not found with Id ", null);
                            }
                            return callback(null, participation);
                        }).catch(err => {
                            if(err.kind === 'ObjectId') {
                                return callback("Participation not found with Id ", null);    
                            }
                            return callback("Error updating Participation with Id ", null);
                        });
                    }
                }
            }
            if (found && !updated){
                return callback(null, participation);
            }
        }
            if (!found){
                Participation.findOneAndUpdate({participationId: sub.participationId}, {$addToSet:{
                    submissionResults: { questionId: sub.questionId, score: sub.score, difficulty: sub.difficulty, language: sub.language}
                  }}, {new: true}, (err, doc) => {
                    if (err) {
                        console.log("Something wrong when updating data!");
                    }
                  })
                .then(participation => {
                    if(!participation) {
                        return callback("Participation not found with Id ", null);
                    }
                    return callback(null, participation);
                }).catch(err => {
                    console.log(err);
                    if(err.kind === 'ObjectId') {
                        return callback("Participation not found with Id ", null);    
                    }
                    return callback("Error updating Participation with Id ", null);
                });
            }
            
            }).catch(err => {
                console.log(err);
                res.status(500).send({
                    success: false,
                    message: err.message || "Some error occurred while retrieving participation."
                });
            });    
};


exports.getDifficulty = (sub, callback) => {
    Participation.find({participationId: sub.participationId})
    .then(participation => {
        if(!participation) {
            return callback("Participation not found with Id ", null);
        }
        participation = participation[0];
        if(sub.difficulty === 'Easy'){
            if(sub.score === 100){
            if (participation.easySolved.length !== 0){
            //     for(let k = 0; k < participation.easySolved.length; k++){
            //         if (participation.easySolved[k] !== sub.questionId){
            //             participation.easySolved.push
            //         }
            //     }
            //  }
            let compare = inarray(participation.easySolved, sub.questionId);
            if (!compare){
                participation.easySolved.push(sub.questionId);
            } else{
                return callback('QuestionId already present', null);
            }
            } else{
                participation.easySolved.push(sub.questionId);
            }
            return (null, participation);
            }
        } else if(sub.difficulty === 'Medium'){
            if(sub.score === 100){
            if (participation.mediumSolved.length !== 0){
            let compare = inarray(participation.mediumSolved, sub.questionId);
            if (!compare){
                participation.mediumSolved.push(sub.questionId);
            } else{
                return callback('QuestionId already present', null);
            }
            } else{
                participation.mediumSolved.push(sub.questionId);
            }
            return (null, participation);
            }
        } else if(sub.difficulty === 'Hard'){
            if(sub.score === 100){
            if (participation.hardSolved.length !== 0){
            let compare = inarray(participation.hardSolved, sub.questionId);
            if (!compare){
                participation.hardSolved.push(sub.questionId);
            } else{
                return callback('QuestionId already present', null);
            }
            } else{
                participation.hardSolved.push(sub.questionId);
            }
            return (null, participation);
            }
        }
        
    }).catch(err => {
        console.log(err);
        if(err.kind === 'ObjectId') {
            return callback("Participation not found with Id ", null);    
        }
        return callback("Error updating Participation with Id ", null);
    });
}

// Retrieve and return all participations from the database.
exports.findAll = (req, res) => {
    Participation.find()
    .then(participation => {
        res.send(participation);
    }).catch(err => {
        res.status(500).send({
            success: false,
            message: err.message || "Some error occurred while retrieving participation."
        });
    });
};

// Retrieve and return all participation details for user in contest.
exports.findUser = (req, res) => {
    Participation.find({participationId: req.decoded.username + 'Course'})
    .then(participation => {
        res.send(participation);
    }).catch(err => {
        res.status(500).send({
            success: false,
            message: err.message || "Some error occurred while retrieving participation."
        });
    });
};

// // Retrieve and return all participation details.
// exports.findContestPart = (req, res) => {
//     Participation.find({contestId: req.body.contestId})
//     .then(participation => {
//         res.send(participation);
//     }).catch(err => {
//         res.status(500).send({
//             success: false,
//             message: err.message || "Some error occurred while retrieving participation."
//         });
//     });
// };

exports.findUserPart = (result, callback) => {
    Participation.find({participationId: result.participationId})
    .then(participation => {
        if(!participation){
            return callback("Couldn't find participation", null);
        }
        return callback(null, participation);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return callback("Couldn't find participation, caught exception", null);                 
        }
        return callback("Error retrieving data", null);
    });
};