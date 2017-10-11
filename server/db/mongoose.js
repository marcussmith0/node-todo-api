const mongoose = require('mongoose');

const url = process.env.MONGODB_URI || 'mongodb://localhost/TodoApp';

mongoose.Promise = global.Promise;
mongoose.connect(url);

module.exports = { mongoose }