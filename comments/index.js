//require express
const express = require("express");
const axios = require("axios");
//require body-parser
const bodyParser = require("body-parser");
//require randomBytes
const { randomBytes } = require("crypto");

//require cors
const cors = require("cors");

//express app instance
const app = express();
//body-parser middleware
app.use(bodyParser.json());
//encoding middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const commentsByPostId = {};

//get request to /posts/:id/comments
app.get("/posts/:id/comments", (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

//handle post request to /posts/:id/comments
app.post("/posts/:id/comments",  async(req, res) => {
    const commentId = randomBytes(4).toString("hex");
    const { content } = req.body;
    const comments = commentsByPostId[req.params.id] || [];
    const newComment = { id: commentId, content, status: "pending" };
    comments.push(newComment);
    commentsByPostId[req.params.id] = comments;
    //emit an event to event bus
    await axios.post("http://event-bus-srv:4005/events", {
        type: "CommentCreated",
        data: {
            id: commentId,
            content,
            postId: req.params.id,
            status: "pending"
        }
    }).catch(err => { console.log(err.message) });

    res.status(201).send(newComment);
});

app.post('/events', (req, res) => {
    console.log('Received Event', req.body.type);
    const { type, data } = req.body;
    if (type === 'CommentModerated') {
        const { postId, id, status, content } = data;
        const comments = commentsByPostId[postId];
        const comment = comments.find(comment => {
            return comment.id === id;
        });
        comment.status = status;
        axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentUpdated',
            data: {
                id, status, postId, content
            }
        }).catch(err => { console.log(err.message) });
    }

    res.send({});
});

//listen to port 4001
app.listen(4001, () => {
    console.log("Listening on 4001");
});
