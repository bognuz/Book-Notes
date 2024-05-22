import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";





const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "BookNotes",
  password: "Kode1234",
  port: 5432,
});
db.connect();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



var bookList = [];


app.get("/", async(req,res) => {

  const allBooks = await db.query("SELECT * FROM books");

  allBooks.rows.forEach(book => {
    bookList.push(book);
  })
  
  res.render("index.ejs", {bookList: bookList});
})


app.post("/add", (req, res) => {

  res.render("add.ejs");
})

app.post("/addbook", async (req, res) => {

  const ISBN = req.body.ISBN;
  const note = req.body.note;
  const rating = req.body.rating;
  const date = new Date();
  const dateRead = date.toLocaleDateString('en-GB');

  
  const isbnPattern = /^(?:\d{10}|\d{13})$/;
  if (!isbnPattern.test(ISBN)) {
    res.render("add.ejs", { error: "Invalid ISBN format." });
    return;
  }

  const apiRequest = await axios.get(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${ISBN}&format=json&jscmd=data`, {headers: {'User-Agent': 'BookNotes (nuzhnyy@live.dk)'}}
  );

const dataFromApi = apiRequest.data[`ISBN:${ISBN}`];
console.log(dataFromApi);

if(dataFromApi) {
  const bookTitle = dataFromApi.title;
  const bookAuthor = dataFromApi.authors[0].name;
  const bookCover = dataFromApi.cover.medium;


  await db.query ('INSERT INTO books (isbn, booktitle,bookcover,bookauthor,note,rating,dateread) VALUES ($1, $2, $3, $4, $5, $6, $7)', [ISBN, bookTitle,bookCover, bookAuthor, note, rating, dateRead]);
  
  res.redirect("/");
} else{

  res.render("add.ejs", {error: "Book is not found"});
}



})


app.listen (port, () => {
  console.log(`Server is op and running on port${port}`)
});