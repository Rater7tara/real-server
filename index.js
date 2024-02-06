const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


// MongoDB functions
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@nowshinkhan.c8ljhxf.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const taskCollection = client.db('fitnessDB').collection('tasks');

    // Search by task name Using Index Backend Route
    app.get('/searchtask/:text', async (req,res)=>{
      const searchtask=req.params.text
      const result =await taskCollection.find({
          name:searchtask
      }).toArray()
      res.send(result)
  })


  app.get('/alltask', async (req, res) => {
    let query = {}
    if (req.query?.email) {
        query = { email: req.query.email }
    }
    const result = await taskCollection.find(query).sort({price: -1}).limit(20).toArray()
    res.send(result)
})


app.get('/searchtask/:text', async (req, res) => {
  const searchtask = req.params.text;
  const result = await taskCollection.find({
    $or: [
      { name: { $regex: searchText, $options: "i" } },
      { category: { $regex: searchText, $options: "i" } }
  ]
  }).toArray();
  res.send(result);
});

    app.get('/alltask/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await taskCollection.findOne(query);
      res.send(result);
  })



    app.post('/alltask', async(req, res) =>{
      const newTask = req.body;
      console.log(newTask);
      const result = await taskCollection.insertOne(newTask)
      res.send(result);
    })

    app.delete('/alltask/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await taskCollection.deleteOne(query);
      res.send(result);
  })

  app.put('/alltask/:id', async(req, res) =>{
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)}
    const options = { upsert: true };
    const updateTask =req.body;
    const task = {
      $set:{
        id: updateTask.id,
          title: updateTask.title,
          description: updateTask.description,
          completed: updateTask.completed,
          time: updateTask.time,
      }
    }

    const result = await taskCollection.updateOne(filter, task, options)
    res.send(result);
  })



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('fitness server is running')
})

app.listen(port, () => {
    console.log(`fitness Server is running on port: ${port}`)
})