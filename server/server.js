require("./config/config");

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const { ObjectID } = require("mongodb");

const { mongoose } = require("./db/mongoose");
const { authenticate } = require("./middleware/authenticate");

const User = require("./models/User");
const Todo = require("./models/Todo");

const app = express();

const PORT = process.env.PORT;

app.use(bodyParser.json());

app.post("/todos", (req, res) => {

    var newTodo = new Todo({
        text: req.body.text
    });

    newTodo.save().then((doc) => {
        res.send(doc);
    }, e => res.status(400).send(e));
});

app.get("/todos", (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, e => res.status(400).send(e));
});

app.get("/todos/:id", (req, res) => {
    var id = req.params.id
    if(!ObjectID.isValid(id)) return res.status(404).send();

    Todo.findById(id).then((todo) => {
        if(!todo) return res.status(404).send();

        res.send({todo});
    }).catch(e => res.status(400).send());
});

app.delete("/todos/:id", (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)) return res.status(404).send();

    Todo.findByIdAndRemove(id).then((todo) => {
        if(!todo) return res.status(404).send();

        res.send({todo});
    }).catch(e => res.status(400).send());
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);
  
    if (!ObjectID.isValid(id)) return res.status(404).send();
  
    if (_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
    } else {
      body.completed = false;
      body.completedAt = null;
    }
  
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
      if (!todo) {
        return res.status(404).send();
      }
  
      res.send({todo});
    }).catch(e => res.status(400).send());
  });

//USERS APIs

app.post("/users", (req, res) => {
    var userInfo = _.pick(req.body, ["email", "password"]);
    var newUser = new User(userInfo);

    newUser.save().then(() => {
        return newUser.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(newUser);
    }).catch(e => res.status(400).send(e));
});

app.get("/users/me", authenticate, (req, res) => {
    res.send(req.user);
});

app.delete("/users/me/token", authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => res.status(400).send());
});

app.post("/users/login", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user); 
        })
    }).catch(e => res.status(400).send());
});

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}...`);
});

module.exports = { app }