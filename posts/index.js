//require express
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
//require randomBytes
const { randomBytes } = require('crypto');

//require cors
const cors = require('cors');

//create a new app
const app = express();
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors());
//hashmap to store posts
const posts = {};


//create a new route
app.get('/posts', (req, res) => {
    res.send(posts);
});

//create a post route
app.post('/posts/create', async (req, res) => {
    const id = randomBytes(4).toString('hex');
    const { title } = req.body;

    posts[id] = {
        id, title
    };
    await axios.post('http://event-bus-srv:4005/events', {
        type: 'PostCreated',
        data: {
            id, title
        }
    }).catch(err => { console.log(err.message) });

    //201 status code: request has been fulfilled and has resulted in one or more new resources being created
    res.status(201).send(posts[id]);
});

app.post('/events', (req, res) => {
    console.log('Received Event', req.body.type);
    res.send({});
});

//listen on port 4000
app.listen(4000, () => {
    console.log("v55");
    console.log('Listening on port 4000');
});
