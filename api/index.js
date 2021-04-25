const express = require('express');
const logger = require('morgan');
const users = require('./routes/users');
const files = require('./routes/files');
const bodyParser = require('body-parser');
const mongoose = require('./config/database');
const jwtAuth = require('./middleware/auth');
const fileUpload = require('express-fileupload');

const app = express();
// connection to mongodb
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
app.use(logger('dev'));
app.use(fileUpload());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res){
	res.json({"message" : "Secure File System with Hyperledger Fabric and IPFS"});
});

// public route
app.use('/users', users);

// private route
app.use('/file', jwtAuth.auth, files);

// express doesn't consider not found 404 as an error so we need to handle 404 explicitly
// handle 404 error
app.use(function(req, res, next) {
 let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// handle errors
app.use(function(err, req, res, next) {
	console.log(err);

	if(err.status === 404)
		res.status(404).json({message: "Not found"});
	else 
		res.status(500).json({message: "Something looks wrong :( !!!"});
});

app.listen(3000, function(){
	console.log('Node server listening on port 3000');
});