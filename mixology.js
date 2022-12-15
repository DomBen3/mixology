const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const portNumber = process.env.PORT || 5001;
const myPath = path.resolve(__dirname, "templates");
require("dotenv").config({
  path: path.resolve(__dirname, "credentials/.env"),
});
const axios = require("axios");

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const database = process.env.DATABASE;
const collection = process.env.COLLECTION;

/* Our database and collection */
const databaseAndCollection = {
  db: database,
  collection: collection,
};

/****** DO NOT MODIFY FROM THIS POINT ONE ******/
const { MongoClient, ServerApiVersion } = require("mongodb");
async function main() {
  let app = express();
  app.use(bodyParser.urlencoded({ extended: false }));
  const uri = `mongodb+srv://${userName}:${password}@cluster0.9vie6iz.mongodb.net/?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

  app.get("/", (request, response) => {
    app.use(express.static(myPath));
    app.set("views", myPath);
    app.set("view engine", "ejs");
    response.render("index");
    response.end();
  });
  app.get("/getDrinks", (request, response) => {
    app.use(express.static(myPath));
    app.set("views", myPath);
    app.set("view engine", "ejs");
    response.render("getDrinks", { portnum: portNumber });
    response.end();
  });
  app.get("/processDrinks", (request, response) => {
    app.use(express.static(myPath));
    app.set("views", myPath);
    app.set("view engine", "ejs");
    response.render("index");
    response.end();
  });
  app.get("/savedDrinks", async (request, response) => {
    app.use(express.static(myPath));
    app.set("views", myPath);
    app.set("view engine", "ejs");
    //DEFINE DRINKS HERE, MAKE A TABLE A PUT IN
    let res = [];
    try {
      await client.connect();
      let filter = {};
      const cursor = client
        .db(databaseAndCollection.db)
        .collection(databaseAndCollection.collection)
        .find(filter);

      res = await cursor.toArray();
    } catch (e) {
      console.error(e);
    } finally {
      await client.close();
    }
    let table = "";
    table +=
      "<table border=1> <tr> <th> Name </th> <th> Category </th> <th> Type </th> \
      <th> Instructions </th> <th> Ingredients </th></tr>";
    res.forEach((item) => {
      table += `<tr> <td> ${item.name} </td> <td> ${item.category} </td>  <td> ${item.alcoholic} </td> \
        <td> ${item.instructions} </td> <td> ${item.ingredients} </td></tr>`;
    });
    table += "</table>";
    if (res.length === 0) {
      table = "<h2> You have no saved drinks! </h2>";
    }
    response.render("savedDrinks", { portnum: portNumber, table: table });
    response.end();
  });
  app.get("/searchDrinks", (request, response) => {
    app.use(express.static(myPath));
    app.set("views", myPath);
    app.set("view engine", "ejs");
    response.render("searchDrinks", { portnum: portNumber });
    response.end();
  });

  app.post("/filteredDrinks", async (request, response) => {
    app.use(express.static(myPath));
    app.set("views", myPath);
    app.set("view engine", "ejs");
    let { category, type } = request.body;
    let res = [];
    let res2 = [];
    try {
      await client.connect();
      let filter = {};
      const cursor = client
        .db(databaseAndCollection.db)
        .collection(databaseAndCollection.collection)
        .find(filter);

      const arr = await cursor.toArray();
      res = arr.filter((x) => x.category == category);
      res2 = res.filter((x) => x.alcoholic == type);
      //RES2 IS THE ARRAY, TURN IT INTO A TABLE AND SET IT EQAUL TO THE VARIABLE TABLE
    } catch (e) {
      console.error(e);
    } finally {
      await client.close();
    }
    let table = "";
    table +=
      "<table border=1> <tr> <th> Name </th> <th> Category </th> <th> Type </th> \
      <th> Instructions </th> <th> Ingredients </th></tr>";
    res2.forEach((item) => {
      table += `<tr> <td> ${item.name} </td> <td> ${item.category} </td>  <td> ${item.alcoholic} </td> \
        <td> ${item.instructions} </td> <td> ${item.ingredients} </td></tr>`;
    });
    table += "</table>";
    if (res2.length === 0) {
      table = "<h2> There are no drinks that meet this filter! </h2>";
    }
    response.render("filteredDrinks", {
      category: category,
      type: type,
      table: table,
    });
    response.end();
  });
  app.get("/confirmationDrinks", (request, response) => {
    app.use(express.static(myPath));
    app.set("views", myPath);
    app.set("view engine", "ejs");
    response.render("savedDrinks", { portnum: portNumber });
    response.end();
  });
  app.get("/remove", (request, response) => {
    app.use(express.static(myPath));
    app.set("views", myPath);
    app.set("view engine", "ejs");
    response.render("remove", { portnum: portNumber });
    response.end();
  });
  app.post("/processDrinks", (request, response) => {
    app.use(express.static(myPath));
    app.set("views", myPath);
    app.set("view engine", "ejs");
    let { ingredient } = request.body;
    const uri = `mongodb+srv://${userName}:${password}@cluster0.9vie6iz.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1,
    });
    const options = {
      method: "GET",
      url: "https://the-cocktail-db.p.rapidapi.com/search.php",
      params: { s: ingredient },
      headers: {
        "X-RapidAPI-Key": "948b3143ccmsh60ed0850833eb65p1f3d4ejsnd34eb29d9ae1",
        "X-RapidAPI-Host": "the-cocktail-db.p.rapidapi.com",
      },
    };

    axios
      .request(options)
      .then(async function (response) {
        obj = response.data.drinks;
        for (let i = 0; i < obj.length; i++) {
          let currDrink = obj[i];
          ingredients = [];
          if (currDrink.strIngredient1 != null) {
            ingredients.push(currDrink.strIngredient1);
          }
          if (currDrink.strIngredient2 != null) {
            ingredients.push(currDrink.strIngredient2);
          }
          if (currDrink.strIngredient3 != null) {
            ingredients.push(currDrink.strIngredient3);
          }
          if (currDrink.strIngredient4 != null) {
            ingredients.push(currDrink.strIngredient4);
          }
          if (currDrink.strIngredient5 != null) {
            ingredients.push(currDrink.strIngredient5);
          }
          if (currDrink.strIngredient6 != null) {
            ingredients.push(currDrink.strIngredient6);
          }
          if (currDrink.strIngredient7 != null) {
            ingredients.push(currDrink.strIngredient7);
          }
          if (currDrink.strIngredient8 != null) {
            ingredients.push(currDrink.strIngredient8);
          }
          if (currDrink.strIngredient9 != null) {
            ingredients.push(currDrink.strIngredient9);
          }
          if (currDrink.strIngredient10 != null) {
            ingredients.push(currDrink.strIngredient10);
          }
          if (currDrink.strIngredient11 != null) {
            ingredients.push(currDrink.strIngredient11);
          }
          if (currDrink.strIngredient12 != null) {
            ingredients.push(currDrink.strIngredient12);
          }
          if (currDrink.strIngredient13 != null) {
            ingredients.push(currDrink.strIngredient13);
          }
          if (currDrink.strIngredient14 != null) {
            ingredients.push(currDrink.strIngredient14);
          }
          if (currDrink.strIngredient15 != null) {
            ingredients.push(currDrink.strIngredient15);
          }
          drink = {
            name: currDrink.strDrink,
            category: currDrink.strCategory,
            alcoholic: currDrink.strAlcoholic,
            instructions: currDrink.strInstructions,
            ingredients: ingredients,
          };

          await client
            .db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .insertOne(drink);
        }
      })
      .catch(function (error) {
        console.error(error);
      });
    response.render("addedConfirmation", {
      ingredient: ingredient,
    });
    response.end();
  });
  app.post("/removeConfirmation", async (request, response) => {
    app.use(express.static(myPath));
    app.set("views", myPath);
    app.set("view engine", "ejs");
    let count = 0;
    try {
      await client.connect();
      const result = await client
        .db(databaseAndCollection.db)
        .collection(databaseAndCollection.collection)
        .deleteMany({});
      count = result.deletedCount;
    } catch (e) {
      console.error(e);
    } finally {
      await client.close();
    }
    response.render("removeConfirmation", { count: count });
    response.end();
  });

  app.listen(port);
}

main().catch(console.error);
