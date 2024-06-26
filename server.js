require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const uri = process.env.MONGODB_URI || "your_default_mongodb_uri";
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  tls: true, 
};

app.get('/testConnection', async (req, res) => {
  const client = new MongoClient(uri, options);
  try {
    await client.connect();
    res.status(200).json({ message: "Connection to MongoDB was successful!" });
  } catch (error) {
    console.error("Connection to MongoDB failed:", error);
    res.status(500).json({ message: "Connection to MongoDB failed", error: error.message });
  } finally {
    await client.close();
  }
});

app.get('/User', async (req, res) => {
  const status = req.query.Status;

  if (status == 1) {
    const { Username, Password } = req.query;

    const client = new MongoClient(uri, options);
    try {
      await client.connect();
      const user = await client.db("databaseOT").collection('User').findOne({ "Username": Username });
      if (user) {
        if (user.Password === Password) {
          res.status(200).json([user]);
        } else {
          res.status(401).json({ message: "Invalid password" });
        }
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while fetching the user" });
    } finally {
      await client.close();
    }
  } else {
    const ID = parseInt(req.query.IDuser, 10);
    console.log(ID);
    console.log(status);
    const client = new MongoClient(uri, options);

    try {
      await client.connect();
      const user = await client.db("databaseOT").collection('User').findOne({ "ID_user": ID });
      if (user) {
        res.status(200).json([user]);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while fetching the user" });
    } finally {
      await client.close();
    }
  }
});

app.get("/loadworkOT", async (req, res) => {
  const ID = parseInt(req.query.ID_user, 10);
  console.log("ID_user", ID);
  const client = new MongoClient(uri, options);

  try {
    await client.connect();
    const collection = client.db("databaseOT").collection("WorkOT");
    const users = await collection.find({ "id_user": ID }).toArray();
    const count = await collection.countDocuments({ "id_user": ID });

    if (users.length > 0) {
      res.status(200).json({ count, users });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching the user" });
  } finally {
    await client.close();
  }
});

app.post('/request', async (req, res) => {
  const data = req.body;
  console.log(data);
  console.log(data.length);

  const client = new MongoClient(uri, options);
  try {
    await client.connect();

    for (let i = 0; i < data.length; i++) {
      await client.db("databaseOT").collection("WorkOT").insertOne({
        DocumentID: data[i].DocumentID,
        id_user: parseInt(data[i].ID_user),
        startDate: data[i].startDate,
        location: data[i].location,
        shiftName: data[i].shiftName,
        startTime: data[i].startTime,
        endTime: data[i].endTime,
        TimeOT: data[i].TimeOT,
        PriceOT: data[i].PriceOT,
        note: data[i].note,
        Status: data[i].Status
      });
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while inserting data into MongoDB" });
  } finally {
    await client.close();
  }
});





app.put("/delworkOT", async (req, res) => {
  const { _id } = req.body; 
  console.log(`Received update request for ID: ${_id}`);
  const client = new MongoClient(uri, options);
  try {
    await client.connect(); 
    const collection = client.db("databaseOT").collection("WorkOT");
    const result = await collection.updateOne(
      { _id: new ObjectId(_id) }, 
      { $set: { Status: 0 } }
    );
    
    if (result.modifiedCount > 0) {
      res.sendStatus(204); 
    } else {
      console.log(`No document found with ID: ${_id}`);
      res.sendStatus(404); 
    }
  } catch (error) {
    console.error("Error during update:", error);
    res.sendStatus(500); 
  } finally {
    await client.close(); 
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
