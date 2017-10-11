const MongoClient = require("mongodb").MongoClient;

MongoClient.connect("", (err, db) => {
    if(err) return err;

    console.log("successfully connected to the database");

    db.collection("Todo")

});