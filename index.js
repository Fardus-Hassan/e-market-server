const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 3000

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      'https://e-market01.netlify.app'
    ],
    credentials: true,
  })
);
app.use(express.json())





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ak5lvkp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const ProductCollection = client.db('E-MarketDB').collection('ProductCollection');


    // app.get('/products', async(req, res) => {
    //   const products = await ProductCollection.find({}).toArray();
    //   res.send(products);
    // })

    app.get('/products/byCount/productsCount', async (req, res) => {
      const count = await ProductCollection.estimatedDocumentCount()
      res.send({ count });
  })

    app.get('/products', async (req, res) => {
      const size = parseInt(req.query.size) || 10; // Default to 10 if not provided
      const page = parseInt(req.query.page) || 0; // Default to 0 if not provided
  
      try {
          const cursor = await ProductCollection.find().skip(size * page).limit(size);
          const products = await cursor.toArray();
          res.send(products);
      } catch (error) {
          console.error('Error retrieving products:', error);
          res.status(500).send({ error: 'An error occurred while fetching products' })
      }
  });
  

  app.get('/products/search/product', async (req, res) => {
      const search = req.query.search;
  
      if (!search) {
          return res.status(400).send({ error: 'Search query is required' });
      }
  
      console.log(`Search query: ${search}`);
  
      const query = { name: { $regex: search, $options: 'i' } };
  
      try {
          const result = await ProductCollection.find(query).toArray();
          res.send(result);
      } catch (error) {
          console.error('Error retrieving products:', error);
          res.status(500).send({ error: 'An error occurred while searching for products' });
      }
  });
  




    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('This is E-Market')
})

app.listen(port, () => {
  console.log(`E-Market running on port ${port}`)
})