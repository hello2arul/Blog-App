const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash"); 
const app = express();
const mongoose = require("mongoose");
// for sessions, cookies and authentication
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
// sessions and cookies
// initial config
app.use(session({
	secret: "secret",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


let homeStartingContent = "Welcome to blog, visit compose page to add posts";
const aboutContent = "This is about page";
const contactContent = "This is contact page";

const posts = [];

mongoose.connect("mongodb://localhost:27017/userDB", {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
	email: String, 
	password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// serializes and deserializes the cookie
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
	res.render("home.ejs", {
		startingText: homeStartingContent,
		posts: posts,
	});
});

app.get("/about", function (req, res) {
	res.render("about.ejs", {
		aboutText: aboutContent,
	});
});

app.get("/contact", function (req, res) {
	res.render("contact.ejs", {
		contactText: contactContent,
	});
});

app.get("/compose", function (req, res) {
	res.render("compose.ejs");
});

app.post("/compose", function(req, res) {
	const post = {
		title: req.body.postTitle,
		body: req.body.postBody,
	};
	posts.push(post);
	res.render("userhome.ejs", {
		startingText: "hello",
		posts: posts
	});
});

app.get("/posts/:postId", function(req, res) {
	let postTitle = _.lowerCase(req.params.postId);
	posts.forEach(function(post) {
		if(postTitle === _.lowerCase(post.title)) {
			res.render("post.ejs", {
				postTitle: postTitle,
				postBody: post.body
			});
		}
	});
});

app.get("/logout", function(req, res) {
	req.logout();
	res.redirect("/");
});

app.get("/register", function(req, res) {
	res.render("register.ejs");
});

app.get("/login", function(req, res) {
	res.render("login.ejs");
});


// app.post("/register", function(req, res) {
// 	const username = req.body.username;
// 	const password = req.body.password;
// 	// if the user is already present, redirect to login page
// 	User.findOne({email: username}, function(err, foundUser) {
// 		if(foundUser) {
// 			res.redirect("/login");
// 		}
// 	});

// 	const newUser = new User({
// 		email: username,
// 		password: password
// 	});

// 	newUser.save(function(err) {
// 		if(err) {
// 			console.log(err);
// 		} else {
//  			res.render("userhome.ejs", {
// 				startingText: "Welcome " + req.body.username,
// 				posts: posts 
// 			 });
// 		}
// 	});
// });


// app.post("/login", function(req, res) {
// 	const username = req.body.username;
// 	const password = req.body.password;
// 	User.findOne({email: username}, function(err, foundUser) {
// 		if(err) {
// 			res.redirect("/login");
// 		} else {
// 			if(foundUser.password === password) {
// 				res.render("userhome.ejs", {
// 					startingText: "Welcome " + req.body.username,
// 					posts: posts 
// 				 });
// 			} else {
// 				// if invalid password, redirect to login
// 				res.redirect("/login");
// 			}
// 		}
// 	});
// });


app.get("/userhome", function(req, res) {
	if(req.isAuthenticated) {
		res.render("userhome.ejs", {
			startingText: homeStartingContent,
			posts: posts 
		});
	} else {
		res.redirect("/login");
	}
});

app.post("/register", function(req, res) {
	User.register({username: req.body.username}, req.body.password, function(err, user) {
		if(err) {
			console.log(err);
			res.redirect("/register");
		} else {
			res.redirect("/userhome");
		}
	});
});

app.post("/login", function(req, res) {
	const user = new User({
		username: req.body.username,
		password: req.body.password
	});
	req.login(user, function(err) {
		if(err) {
			console.log(err);
			res.redirect("/login");
		} else {
			passport.authenticate("local")(req, res, function() {
				res.redirect("/userhome");
			});
		}
	})
});


app.listen(3000, () => {
	console.log("Server started at 3000");
});
