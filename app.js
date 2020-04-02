const express = require('express'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	LocalStrategy = require('passport-local'),
	flash = require('connect-flash');

const app = express();

// ------------------------------------------ //
// 			ROUTES CONFIGURATION
// ------------------------------------------ //
const indexRoutes = require('./routes/index'),
	chartRoutes = require('./routes/chart'),
	sensorRoutes = require('./routes/sensor'),
	mapRoutes = require('./routes/map');

// ------------------------------------------ //
// 			SOCKET.IO CONFIGURATION
// ------------------------------------------ //
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.set('socketio', io);

io.on('connection', function(socket) {
	console.log('a user connected');
});

// ------------------------------------------ //
// 			MONGOOSE CONFIGURATION
// ------------------------------------------ //
require('dotenv').config();
const Mongo_URI = process.env.ATLAS_URI;

// const Mongo_URI = 'mongodb://localhost/sapflow';
mongoose
	.connect(Mongo_URI, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: false
	})
	.then((result) => {
		console.log('DB Connected!');
	})
	.catch((err) => {
		console.log(err);
	});

// ------------------------------------------ //
// 			MODELS CONFIG
// ------------------------------------------ //
const Sensor = require('./models/sensor');
const User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
app.use(flash());

// ------------------------------------------ //
// 			PASSSPORT CONFIG
// ------------------------------------------ //
app.use(
	require('express-session')({
		secret: 'Sapflow Project',
		resave: false,
		saveUninitialized: false
	})
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ------------------------------------------ //
// 			FLASH CONFIG
// ------------------------------------------ //
app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});

app.use(indexRoutes);
app.use('/sensor', sensorRoutes);
app.use('/map', mapRoutes);
app.use('/chart', chartRoutes);

http.listen(process.env.PORT || 3000, () => {
	console.log('Hutyra Lab Server has started on port 3000');
});
