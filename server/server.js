const express = require("express");
const bodyParser = require("body-parser");

const { mongoose } = require("./db/mongoose");

const User = require("./models/User");
const Todo = require("./models/Todo");

const app = express();

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

app.listen(3000, () => {
    console.log("Listening on 3000...");
});

module.exports = { app }