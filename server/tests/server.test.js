const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("./../server");
const Todo = require("./../models/Todo");

const todos = [
    { _id: new ObjectID, text: "First test todo" },
    { _id: new ObjectID, text: "second test todo" },
    { _id: new ObjectID, text: "third test todo" },
    { _id: new ObjectID, text: "fourth test todo" },
]

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
});

describe("POST /todos", () => {
    it("should create a new todo", (done) => {
        var text = "test todo"

        request(app)
            .post("/todos")
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if(err) return done(err);

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch(e => done(e));
            });
    });

    it("should not create a new todo", (done) => {
        request(app)
            .post("/todos")
            .send({})
            .expect(400)
            .end((err, res) => {
                if(err) return done(err);

                Todo.find().then(todos => {
                    expect(todos.length).toBe(4);
                    done();
                }).catch(e => done(e));
            });
    });
});

describe("GET /todos", () => {
    it("should get all of the todos in the database", (done) => {
        request(app)
            .get("/todos")
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(4);
            })
            .end(done);
    });
});

describe("GET /todos/:id", () => {
    it("should return a particular todo", (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it("should return a 404", (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()+"11"}`)
            .expect(404)
            .end(done);
    });

    it("should return 404 due to id not being in database", (done) => {
        var id = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${id}`)
            .expect(404)
            .end(done);
    });
});

describe("DELETE /todo/:id", () => {
    it("should delete a todo", (done) => {
        var id = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(id);
            })
            .end((err, res) => {
                if(err) return done(err);

                Todo.findById(id).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch(e => done(e));
            });
    });

    it("should return 404 due to no todo being available", (done) => {
        var id = new ObjectID().toHexString();
        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .end(done);
    });

    it("should return 404 because of invalid id", (done) => {
        var id = new ObjectID().toHexString();
        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .end(done);
    });
});