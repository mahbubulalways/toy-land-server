const express =require('express')
const cors=require('cors')
const app=express()
require('dotenv').config()
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
app.use(cors())
app.use(express.json())
const port=process.env.PORT || 6500


const uri=`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jgce6rp.mongodb.net/?retryWrites=true&w=majority`


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
     client.connect();

    const toyCollection = client.db("toyLand").collection("toys");
  

    app.post('/toys',async(req,res)=>{
        const toys=req.body
        const result=await toyCollection.insertOne(toys)
        res.send(result)
    })

    app.get('/allToys',async(req,res)=>{
        const cursor = toyCollection.find().sort({price: -1});
        const result = await cursor.limit(20).toArray()
        res.send(result)
    })


    app.get('/toy/:id',async(req,res)=>{
        const id =req.params.id
        const query = { _id: new ObjectId(id) };
        const result=await toyCollection.findOne(query)
        res.send(result)
    })

    app.get('/usersToy',async(req,res)=>{
        let sort ={}
        let query={}
        if(req.query.sort){
            sort=parseInt(req.query.sort)
        }
       if(req.query.sellerEmail){
        query={sellerEmail:req.query.sellerEmail}
       }
      const result = await toyCollection.find(query).sort({price:sort}).toArray();
      res.send(result)
    })
  
    app.delete('/myToy/:id',async(req,res)=>{
        const id =req.params.id
        const query = { _id: new ObjectId(id) };
        const result=await toyCollection.deleteOne(query)
        res.send(result)
    })


    app.put('/update/:id',async(req,res)=>{
        const id=req.params.id
        const filter={_id: new ObjectId(id)}
        const options = { upsert: true };
        const newToy =req.body;
        const updatedToy ={
            $set: {
                toyName:newToy.toyName ,
                subCategory:newToy.subCategory ,
                price:newToy.price ,
                quantity:newToy.quantity ,
                details:newToy.details ,
            },
          }
          const result = await toyCollection.updateOne(filter, updatedToy, options);
          res.send(result)
    })


    app.get("/search/:text", async (req, res) => {
        const text = req.params.text;
        const result = await toyCollection.find({
            $or: [
              { toyName: { $regex: text, $options: "i" } },
            ],
          }).toArray();
        res.send(result);
      });

    app.get("/category/:text", async (req, res) => {
        const text = req.params.text;
        const result = await toyCollection.find({
            $or: [
              { subCategory: { $regex: text, $options: "i" } },

            ],
          }).limit(2).toArray();
        res.send(result);
      });
    


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/',(req,res)=>{
    res.send('toy land coming')
})

app.listen(port,()=>{
    console.log('server is running port',port);
})