import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";





const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

var bookList = [];



app.get("/", (req,res) => {


  res.render("index.ejs");
})


app.post("/add", (req, res) => {

  res.render("add.ejs");
})

app.post("/addbook", (req, res) => {

  const ISBN = req.body.ISBN;
  const note = req.body.note;
  console.log(ISBN);
  console.log(note);
  res.redirect("/");
})


app.listen (port, () => {
  console.log(`Server is op and running on port${port}`)
});