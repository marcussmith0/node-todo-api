const { ObjectID } = require("mongodb");
const jwt = require("jsonwebtoken");

const Todo = require("./../../models/Todo");
const User = require("./../../models/User");

var userIdOne = new ObjectID();
var userIdTwo = new ObjectID();

const users = [{
    _id: userIdOne,
    email: "marcus@example.com",
    password: "useronepassword",
    tokens: [{
        access: "auth",
        token: jwt.sign({_id: userIdOne, access: "auth"}, process.env.JWT_SECRET).toString()
    }]
}, {
    _id: userIdTwo,
    email: "james@example.com",
    password: "usertwopassword",
    tokens: [{
        access: "auth",
        token: jwt.sign({_id: userIdTwo, access: "auth"}, process.env.JWT_SECRET).toString()
    }]
}];

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: userIdOne
  }, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333,
    _creator: userIdTwo
  }];

var populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};
  

var populateTodos = (done) => {
    Todo.remove({}).then(() => {
      return Todo.insertMany(todos);
    }).then(() => done());
  }

module.exports = {
    todos,
    populateTodos,
    users,
    populateUsers
}