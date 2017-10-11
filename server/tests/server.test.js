const expect = require("expect");
const request = require("supertest");

const { app } = require("./../server");
const Todo = require("./../models/Todo");

const todos = [
    { "text": "First test todo" },
    { "text": "second test todo" },
    { "text": "third test todo" },
    { "text": "fourth test todo" },
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


