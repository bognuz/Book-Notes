import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import dotenv from "dotenv";


dotenv.config({ path: "./data.env" });


const app = express();
const port = 3000;

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));





async function getBooks(){
  const allBooks = await db.query("SELECT * FROM books");
  let bookList = [];
  
  allBooks.rows.forEach(book => {
    bookList.push(book);
  })

  return bookList;

};

app.get("/", async(req,res) => {

const bookList = await getBooks();
  
  res.render("index.ejs", {bookList: bookList});
})

app.get("/edit", async(req,res) => {

  const bookId = req.query.id;

const query = await db.query('Select * FROM books WHERE id=($1)', [bookId]);
 const book = query.rows[0];


res.render("edit.ejs", {book: book});
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

app.post("/bookEdited", async (req, res) =>{

  const id = req.body.id;
  const note = req.body.note;
  const rating = req.body.rating;
  const date = new Date();
  const dateRead = date.toLocaleDateString('en-GB');
  await db.query('UPDATE books SET note = $1, rating = $2, dateread = $3 WHERE id = $4', [note, rating, dateRead, id]);


  res.redirect("/");

});

app.post("/deleteBook", async (req, res) => {
  const id = req.body.id;

 
  await db.query('DELETE FROM books WHERE id = $1', [id]);
  res.redirect("/");


});

app.listen (port, () => {
  console.log(`Server is op and running on port${port}`)
});