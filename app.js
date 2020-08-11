const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash"); 

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

const homeStartingContent = "Welcome to my blog, visit compose page to add posts";

const aboutContent = "This is about page";

const contactContent = "This is contact page";

const posts = [];

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
	res.redirect("/");
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

app.listen(3000, () => {
	console.log("Server started at 3000");
});
