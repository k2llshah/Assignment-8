var express = require("express"),cmd
    http = require("http"),
    // import the mongoose library
    mongoose = require("mongoose"),

    app = express();
server = http.createServer(app);
var io = require('socket.io').listen(server);


app.use(express.static(__dirname + "/client"));
app.use(express.bodyParser());


// connect to the amazeriffic data store in mongo
mongoose.connect('mongodb://localhost/amazeriffic');

// This is our mongoose model for todos
var ToDoSchema = mongoose.Schema({
    description: String,
    tags: [String]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);

//http.createServer(app).listen(3000);

app.get("/todos.json", function(req, res) {
    ToDo.find({}, function(err, toDos) {
        res.json(toDos);
    });
});

io.on('connection', function(socket) {

    socket.on('newToDO', function(msg) {
        console.log("newToDo called");
        var newToDo = new ToDo(msg);
        newToDo.save(function(err, result) {
            if (err !== null) {
                res.send("ERROR");
            } else {
                ToDo.find({}, function(err, result) {
                    if (err !== null) {
                        // the element did not get saved!
                        res.send("ERROR");
                    }
                    io.emit('updateToDO', result);
                });
            }
        });

    });
});
server.listen(3000);