import express from 'express';
import mongoose from "mongoose";
import session from "express-session";
import ConnectMongoDbStore from "connect-mongodb-session";
import csrf from "csurf";
import flash from "connect-flash";
import multer from "multer";
import {v4} from "uuid";
import helmet from "helmet";
import compression from "compression";

import adminRoutes from './routes/admin.js';
import shopRoutes from './routes/shop.js';

import {authRoutes} from "./routes/auth.js";
import {get404, get500} from "./controllers/error.js";
import {User} from "./models/user.js";


const MongoDbStore = ConnectMongoDbStore(session);

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.roxg3b6.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

console.log(MONGODB_URI);

const app = express();
const store = new MongoDbStore({
    uri: MONGODB_URI,
    collection: 'session'
});

// const privateKey = readFileSync('server.key');
// const certificate = readFileSync('server.cert');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/');
    },
    filename: (req, file, cb) => {
        cb(null, v4() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'||
        file.mimetype === 'image/jifif') {

        cb(null, true);
    } else {
        cb(null, false)

    }
};

const limits = {
    fileSize: 1024 * 1024 * 5
}

app.set('view engine', 'ejs');
app.set('views', 'views');

// const accessLogStream = createWriteStream(join('access.log'), {flags: 'a'});

app.use(helmet());
app.use(compression());
// app.use(morgan('combined', {stream: accessLogStream}));

app.use(multer({ storage, fileFilter, limits }).single('image'));
app.use(session({
    secret: 'secret :)',
    resave: false,
    saveUninitialized: false,
    store
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/static', express.static('static'));
app.use('/images', express.static('images'));
app.use(csrf({}));

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use(flash());


app.use(async (req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return next();
        }
        req.user = user;
        next();
    } catch (e) {
        console.log(e);
        next(new Error(e));
    }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', get500);
app.use(get404);

app.use((err, req, res, next) => {
    // res.redirect('/500');
    res.status(500).render('500', {
        pageTitle: 'Error 500',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
});

try {
    await mongoose.connect(MONGODB_URI);

    app.listen(process.env.PORT || 3000);
    // https.createServer({key: privateKey, cert: certificate}, app).listen(process.env.PORT || 3000);
    console.log(`CONNECTED at http://localhost:${process.env.PORT || 3000}/\n`);
} catch (e) {
    console.log(e);
}