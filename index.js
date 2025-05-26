import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import pool from "./db.js"
import "dotenv/config";


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
   //const cart = await pool.query("SELECT * FROM cart");
    const items = await pool.query("SELECT * FROM items ORDER BY id")
    
    
    const cart = await pool.query("SELECT items.ID, items.item, cart.amount, items.price, items.price * cart.amount AS totalprice FROM items INNER JOIN cart ON items.item = cart.item ORDER BY id");
    res.render("index.ejs", {cart: cart.rows, items: items.rows} );
})

app.get("/cart", async (req, res) =>{
    const cart = await pool.query("SELECT items.ID, items.item, cart.amount, items.price, items.price * cart.amount AS totalprice FROM items INNER JOIN cart ON items.item = cart.item ORDER BY id");
    res.render("kundvagn.ejs", {cart: cart.rows})

})

app.get("/login", async (req, res) =>{
    res.render("login.ejs")
})

app.get("/admin", async (req, res) =>{
    const items = await pool.query("SELECT * FROM items ORDER BY id")

    res.render("admin.ejs", {items: items.rows})
})

app.post("/updateItem/:id", async (req, res) =>{
    const id = req.params.id;
    const newPrice = req.body.newPrice;
    await pool.query("UPDATE items SET price = $1 WHERE id = $2", [newPrice, id]);
    res.redirect("/admin")
})

app.post("/deleteItem/:id", async (req, res) =>{
    const id = req.params.id;
    await pool.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/admin")
})

app.post("/addItem", async (req, res) =>{
    const name = req.body.itemName;
    const price = req.body.itemPrice;

    await pool.query("INSERT INTO items (item, price) VALUES ($1, $2)", [name, price]);
    
    res.redirect("/admin");
})


app.post("/add", async (req, res) =>{
    const item = req.body.item_name
    const itemID = req.body.item_id

    
    
    
    const currentItemExists = await pool.query("SELECT EXISTS (SELECT item FROM cart WHERE item = ($1))", [item]);
    if (currentItemExists.rows[0].exists == false){
        await pool.query("INSERT INTO cart (item) VALUES ($1)", [item]);

    }
    else {
        await pool.query("UPDATE cart SET amount = amount + 1 WHERE id = ($1)", [itemID])

    }
    await pool.query("UPDATE items SET amount = amount + 1 WHERE id = ($1)", [itemID])

    res.redirect("/");
})

app.post("/remove", async (req, res) =>{
    const item = req.body.item_name
    const itemID = req.body.item_id

    const currentAmount = await pool.query("SELECT amount FROM cart WHERE item = ($1)", [item   ]);
    try{
    if (currentAmount.rows[0].amount > 1){
        await pool.query("UPDATE cart SET amount = amount - 1 WHERE item = ($1)", [item])
        await pool.query("UPDATE items SET amount = cart.amount WHERE id = ($1)", [itemID])

    }
    else {
        await pool.query("DELETE FROM cart WHERE item = ($1)", [item])
        await pool.query("UPDATE items SET amount = amount - 1 WHERE item = id = ($1)", [itemID])

        }
    }
    catch{
        console.log("cart empty")
    }
    res.redirect("/")
})

app.post("/omoss", async (req, res) =>{
    res.render("omOss.ejs")
})

app.post("/register", async (req, res) => {
    const { användarnamn, lösenord } = req.body;
  
    console.log("Form data received:");
    console.log("Användarnamn:", användarnamn);
    console.log("Lösenord:", lösenord);
  
    try {
      const result = await pool.query(
        "INSERT INTO users (användarnamn, lösenord) VALUES ($1, $2)",
        [användarnamn, lösenord]
      );
      console.log("DB insert result:", result);
      res.send("Användare sparad!");
    } catch (err) {
      console.error("DB error:", err);
      res.status(500).send("Fel vid databasåtkomst.");
    }
  });