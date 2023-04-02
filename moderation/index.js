const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post('/events', async (req, res) => {
    const { type, data } = req.body;
    if (type === 'CommentCreated') {

        let { id, content, postId, status } = data;
        status = content.includes('orange') ? 'rejected' : 'approved';
        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentModerated',
            data: {
                id, content, postId, status
            }
        }).catch(err => { console.log(err.message) });
    }
});

app.listen(4003, () => {
    console.log('Listening on 4003');
});
