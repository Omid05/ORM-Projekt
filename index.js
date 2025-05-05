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
   //const cart = await db.query("SELECT * FROM cart");
    const items = await db.query("SELECT * FROM items ORDER BY id")
    
    
    const cart = await db.query("SELECT items.ID, items.item, cart.amount, items.price, items.price * cart.amount AS totalprice FROM items INNER JOIN cart ON items.item = cart.item ORDER BY id");
    res.render("index.ejs", {cart: cart.rows, items: items.rows} );
})


app.post("/add", async (req, res) =>{
    const item = req.body.item_name
    
    
    
    const currentItemExists = await db.query("SELECT EXISTS (SELECT item FROM cart WHERE item = '" + item + "')");
    if (currentItemExists.rows[0].exists == false){
        await db.query("INSERT INTO cart (item) VALUES ($1)", [item]);

    }
    else {
        await db.query("UPDATE cart SET amount = amount + 1 WHERE item = '" + item + "'")

    }
    await db.query("UPDATE items SET amount = amount + 1 WHERE item = '" + item + "'")

    res.redirect("/");
})

app.post("/remove", async (req, res) =>{
    const item = req.body.item_name
    const currentAmount = await db.query("SELECT amount FROM cart WHERE item = '" + item + "'");
    try{
    if (currentAmount.rows[0].amount > 1){
        await db.query("UPDATE cart SET amount = amount - 1 WHERE item = '" + item + "'")
        await db.query("UPDATE items SET amount = amount - 1 WHERE item = '" + item + "'")

    }
    else {
        await db.query("DELETE FROM cart WHERE item = '" + item + "'")
        await db.query("UPDATE items SET amount = amount - 1 WHERE item = '" + item + "'")

        }
    }
    catch{
        console.log("cart empty")
    }
    res.redirect("/")
})