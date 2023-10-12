require("dotenv").config();
const express = require("express");
const app = express();
const userRouter = require("./routes/userRoutes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const connectDB = require("./utils/connectDB");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const staticRouter = require("./routes/staticRoutes");
const employeeRouter = require("./routes/employeeRoutes");

app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use(
    session({
        secret: process.env.SESSION_KEY,
        resave: true,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_ATLAS_URL }),
        cookie: { maxAge: 60 * 60 * 24 * 365 * 1000 },
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(userRouter);
app.use(staticRouter);
app.use(employeeRouter);

passport.serializeUser((user, done) => {
    return done(null, { id: user._id.toString(), role: `${user.role}` });
});

passport.deserializeUser((user, done) => {
    return done(null, { id: user.id, role: user.role });
});

app.listen(process.env.PORT, () => {
    try {
        console.log(`Server is running on port ${process.env.PORT}`);
    } catch (error) {
        return console.log(`Error in starting server : ${error}`);
    }
});
