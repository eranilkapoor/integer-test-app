'use strict';

const express 	    = require('express');
const cookieParser 	= require('cookie-parser');
const bodyParser 	= require('body-parser');
const jwt           = require('jsonwebtoken');
const cors          = require('cors');
const fs            = require('fs');
const multer        = require('multer');
const passport      = require('passport');
const redis         = require('redis');
const client        = redis.createClient('6379', '127.0.0.1');

const config        = require('./src/config/config');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

const AuthMiddleware = require('./src/middlewares/auths');
const authMiddleware = new AuthMiddleware();

const passportObj = require('./src/middlewares/passport');

app.use(express.static('public'));

app.use(passport.initialize());

passportObj(passport);

client.on('connect', function() {
    console.log('connected');
});

app.post('/api/getNextInteger', passport.authenticate('google'), function(req, res){
    let nextInteger = client.get('INTEGER-'+ req.headers.authorization) + 1;
    
    res.json({
        'nextInteger': nextInteger
    });
});

app.post('/api/getCurrentInteger', passport.authenticate('google'), function(req, res){
    let nextInteger = client.get('INTEGER-'+ req.headers.authorization);
    
    res.json({
        'nextInteger': nextInteger
    });
});

app.post('/api/resetCurrentInteger', passport.authenticate('google'), function(req, res){
    if(req.body.resetInteger > 0){
        let nextInteger = client.set('INTEGER-'+ req.headers.authorization, req.body.resetInteger);

        res.json({
            'nextInteger': nextInteger
        });
    }
});

app.post('/api/register', authMiddleware.registerRequestValidate, function(req, res){
    if(req.body.email){
        const token = jwt.sign({data: req.body.email}, config.secret, { expiresIn: 60 * 1 });
        client.set('INTEGER-'+ token, '');
        res.json({success: true, token: token});   
    } else {
        res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
    }
});

app.get('/api/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/api/google/redirect', passport.authenticate('google', { failureRedirect: '/api/register' }), function(req, res) {
    client.set('INTEGER-'+ res.token, '');
    res.redirect('/');
});

app.get('/api/logout', function(req, res){
    client.set('INTEGER-'+ req.headers.authorization, '');
    req.logout();
    res.redirect('/');
});

// Main Application Route
app.get('/*', authMiddleware.htmlHeader, function(req, res){
    res.send(__dirname + '/public/index.html');
});

app.set('port', (config.port || 3000));
app.listen(app.get('port'), function(){
    console.log('I\'m Listening... on port number '+ app.get('port'));
});