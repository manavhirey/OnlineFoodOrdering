require('dotenv').config()
const express = require('express')
const app = express()
const ejs = require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 3000
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')(session)
const mongoose = require('mongoose')

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
//Session Config
app.use(session({
    secret: process.env.COOKIES_ENCRYPT,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24 } //24 hours validity
}))

app.use(flash())


//set Template Engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine','ejs')

// Asset Location
app.use(express.static('public'))
app.use(express.json())

//Global Middleware
app.use((req, res, next) => {
    res.locals.session = req.session
    next()
})

// Routes
require('./routes/web')(app)

app.listen(PORT, () =>{
    console.log(`Listening on port ${PORT}`)
})