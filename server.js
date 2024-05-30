const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const uri = "mongodb+srv://jgamerz0001:Jame0881509604@cluster0.vimmbax.mongodb.net/";

app.get('/User', async (req, res) => {
  const status = req.query.Status;
  
 
  if (status == 1) {
    const { Username, Password } = req.query;

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
      await client.connect();
      const user = await client.db("databaseOT").collection('User').findOne({ "Username": Username });
      if (user) {
       
        if (user.Password === Password) {
          res.status(200).send("Login Successful");
        } else {
          res.status(401).send("Invalid password");
        }
      } else {
        res.status(404).send("User not found");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while fetching the user");
    } finally {
      await client.close();
    }
  } else{
    const ID = parseInt(req.query.IDuser, 10);
    console.log(ID);
    console.log(status);
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
    try {
      await client.connect();
      const user = await client.db("databaseOT").collection('User').findOne({ "ID_user": ID });
      if (user) {
        res.status(200).send([user]);
      } else {
        res.status(404).send("User not found");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while fetching the user");
    } finally {
      await client.close();
    }
  }
 
});

app.get("/loadworkOT", async (req, res) => {
  const ID = parseInt(req.query.ID_user, 10);
  console.log("ID_user", ID);
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const cursor = client.db("databaseOT").collection("WorkOT").find({ "id_user": ID });
    const users = await cursor.toArray();
    
    
    const count = await cursor.count();
    
    if (users.length > 0) {
      res.status(200).send({ count, users });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching the user");
  } finally {
    await client.close();
  }
});

app.post('/request', async (req, res) => {
  const data = req.body;
  console.log(data);
  console.log(data.length); 

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();

    for (let i = 0; i <data.length;i++){
      const user = await client.db("databaseOT").collection("WorkOT").insertOne({
        DocumentID: data[i].DocumentID,
        id_user: parseInt(data[i].ID_user),
        startDate: data[i].startDate,
        location: data[i].location,
        shiftName: data[i].shiftName,
        startTime: data[i].startTime,
        endTime: data[i].endTime,
        TimeOT: data[i].TimeOT,
        PriceOT:data[i].PriceOT,
        note: data[i].note,
        Status:data[i].Status
      });
    }

    res.status(200).send({ "status": "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while inserting data into MongoDB");
  } finally {
    await client.close();
  }
});




const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
