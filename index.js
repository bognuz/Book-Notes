import express from "express";





const app = express();
const port = 3000;

app.use(express.static("public"));

// Set EJS as the view engine
app.set('view engine', 'ejs');

app.get("/", (req,res) => {


  res.render("index.ejs");
})


app.post("/add", (req, res) => {

  res.render("add.ejs");
})

app.post("/addbook", (req, res) => {

  res.redirect("/");
})


app.listen (port, () => {
  console.log(`Server is op and running on port${port}`)
});