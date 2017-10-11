const express = require("express");
const bodyParser = require("body-parser");
const { ObjectID } = require("mongodb");

const { mongoose } = require("./db/mongoose");

const User = require("./models/User");
const Todo = require("./models/Todo");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/todos", (req, res) => {

    var newTodo = new Todo({
        text: req.body.text
    });

    newTodo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get("/todos", (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get("/todos/:id", (req, res) => {
    if(!ObjectID.isValid(req.params.id)) return res.status(404).send();

    Todo.findById(req.params.id).then((todo) => {
        if(!todo) return res.status(404).send();

        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    });
});

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}...`);
});

module.exports = { app }