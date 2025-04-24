import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;


const db = new pg.Pool({
user: "postgres",
  host: "localhost",
  database: "ORM",
  password: "123",
  port: 5432,
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");


app.listen(port, () => {
    console.log(`lyssnar på port ${port}`);

})

app.get("/", async (req, res) => {
    const result = await db.query("SELECT * FROM cart");
    res.render("index.ejs", {cart: result.rows});
})


app.post("/add", async (req, res) =>{
    const item = "no"
    
    
    
    const currentItemExists = await db.query("SELECT EXISTS (SELECT item FROM cart WHERE item = '" + item + "')");
    if (currentItemExists.rows[0].exists == false){
        await db.query("INSERT INTO cart (item) VALUES ($1)", [item]);
    }
    else {
        await db.query("UPDATE cart SET amount = amount + 1 WHERE item = '" + item + "'")
    }
    res.redirect("/");
})

app.post("/remove", async (req, res) =>{
    const item = "no"
    const currentItemExists = await db.query("SELECT EXISTS (SELECT item FROM cart WHERE item = '" + item + "')");
    if (currentItemExists.rows[0].exists == false){
        await db.query("INSERT INTO cart (item) VALUES ($1)", [item]);
    }
    else {
        await db.query("UPDATE cart SET amount = amount + 1 WHERE item = '" + item + "'")
    }
    res.redirect("/")
})