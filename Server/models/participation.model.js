// MONGOOSE SCHEMA

const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var participationSchema = new Schema({
  participationId: String,
  username: String,
  contestId: String,
  participationTime: String,
  submissionResults: Array,
  validTill: String,
});

module.exports = mongoose.model("Participation", participationSchema);
