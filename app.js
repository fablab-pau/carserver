var express = require('express');
var socketio = require('socket.io');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var io = socketio();
var piblaster = require('pi-blaster.js');

var server = require('http').Server(app);
app.io = io;

var GPIO_ENGINE = 17
var GPIO_DIRECTION = 22
var FORWARD = 0.1
var REVERSE = 0.2
var RIGHT = 0.23
var LEFT = 0.09
var STRAIGHT = 0.16

var programIdCounter = 0;
var currentProgram = null;

function execute(programId, program, step) {
    console.log(programId, program, step, currentProgram);
    if (currentProgram !== programId) { // Abort execution of a canceled program
        return;
    }
    if (program.length >= step) {
        return;
    }
    if (program[step].command === 'FORWARD') {
        piblaster.setPwm(GPIO_ENGINE, FORWARD);
        setTimeout(function () {
            piblaster.setPwm(GPIO_ENGINE, 0);
            execute(programId, program, step + 1)
        }, arguments[0] * 1000)
    } else if (program[step].command === 'REVERSE') {
        piblaster.setPwm(GPIO_ENGINE, REVERSE);
        setTimeout(function () {
            piblaster.setPwm(GPIO_ENGINE, 0);
            execute(programId, program, step + 1)
        }, arguments[0] * 1000)
    } else if (program[step].command === 'RIGHT') {
        piblaster.setPwm(GPIO_DIRECTION, RIGHT);
        setTimeout(function () {
            execute(programId, program, step + 1)
        }, 500)
    } else if (program[step].command === 'LEFT') {
        piblaster.setPwm(GPIO_DIRECTION, LEFT);
        setTimeout(function () {
            execute(programId, program, step + 1)
        }, 500)
    } else if (program[step].command === 'STRAIGHT') {
        piblaster.setPwm(GPIO_DIRECTION, STRAIGHT);
        setTimeout(function () {
            execute(programId, program, step + 1)
        }, 500)
    }
}

io.on('connection', function (socket) {
    socket.on('STOP', function () {
        currentProgram = null;
        piblaster.setPwm(GPIO_ENGINE, 0);
    });
    socket.on('disconnect', function () {
        currentProgram = null;
        piblaster.setPwm(GPIO_ENGINE, 0);
    });
    socket.on('RUN', function (data) {
        console.log(data);
        var programId = programIdCounter++
        currentProgram = programId;
        piblaster.setPwm(GPIO_ENGINE, 0);
        execute(programId, data, 0);
    });
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
