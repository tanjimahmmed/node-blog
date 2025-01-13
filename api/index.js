const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const secret = 'adadbbdiwtewu526352424';

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());

mongoose.connect('mongodb+srv://tanjimitsolution:yNDil0ObprlA6mkQ@mern-auth-db.s8o9e.mongodb.net/mern-auth-db?retryWrites=true&w=majority&appName=mern-auth-db');

app.post('/register', async (req, res) => {
    const {username, password} = req.body;
    try {
        const userDoc = await User.create({username, password:bcrypt.hashSync(password, 10)})
        res.json(userDoc)
    } catch (err) {
        res.status(400).json(err)
    } 
});

app.post('/login', async(req, res) => {
    const {username, password} = req.body;
    const userDoc = await User.findOne({username});
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if(passOk) {
        jwt.sign({username, id: userDoc._id}, secret, {}, (err,token) => {
            if(err) throw err;
            res.cookie('token', token).json({
                id: userDoc._id,
                username
            });
        })
    } else {
        res.status(400).json('wrong credentials');
    }
});

app.get('/profile', (req, res) => {
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, (err,info) => {
        if(err) throw err;
        res.json(info);
    })
    res.json(req.cookies)
})

app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok')
});

app.listen(4000);