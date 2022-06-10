require('dotenv').config()
const express = require('express')
const app = express()
const ejs = require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 3000
const session = require('express-session')
const flash = require('express-flash')
const passport = require('passport')
const MongoDbStore = require('connect-mongo')(session)
const mongoose = require('mongoose')
const Emitter = require('events')

//Database Connection
const url = 'mongodb://localhost/sloppyjoes';
mongoose.connect(url, {useNewUrlParser : true});
const connection = mongoose.connection;
mongoose.connection.once('open', () => {
    console.log('Database connected...');
}).on('error',err => {
    console.log('Connection failed...')
});

//Session Store
let mongoStore = new MongoDbStore({
    mongooseConnection: connection,
    collection: 'sessions' 
})

// Event Emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)

//Session Config
app.use(session({
    secret: process.env.COOKIES_ENCRYPT,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24 } //24 hours validity
}))

// Passport Config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

// Asset Location
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//Global Middleware
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

//set Template Engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine','ejs')


// Routes
require('./routes/web')(app)

const server = app.listen(PORT, () =>{
    console.log(`Listening on port ${PORT}`)
})

// Socket.io

const io = require('socket.io')(server)
io.on('connection', (socket) => {
    // Join 
    socket.on('join',(roomName) => {
        socket.join(roomName)
    })
})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})