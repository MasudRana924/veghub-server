const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
const fileUpload = require('express-fileupload');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middleware 
app.use(cors())
app.use(express.json())
app.use(fileUpload());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hrpwo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const database = client.db('veg_hub')
        console.log('database connected')
        // foods connection
        const productsCollections = database.collection('products')  
        const meatsCollections = database.collection('meat')
        const fishesCollections = database.collection('fish')
        const fruitsCollections = database.collection('fruits')
        const dryfoodsCollections = database.collection('dryfoods')
        // user connection
        const usersCollection = database.collection('users')
        const ordersCollection = database.collection('orders')
        const messagesCollection = database.collection('messages')

        // get api for all data 
        app.get('/allproducts', async (req, res) => {
            const cursor = productsCollections.find({})
            const product = await cursor.toArray()
            res.send(product)

        })
        app.get('/meats', async (req, res) => {
            const cursor = meatsCollections.find({})
            const product = await cursor.toArray()
            res.send(product)

        })
        app.get('/fishes', async (req, res) => {
            const cursor = fishesCollections.find({})
            const product = await cursor.toArray()
            res.send(product)

        })
        app.get('/fruits', async (req, res) => {
            const cursor = fruitsCollections.find({})
            const product = await cursor.toArray()
            res.send(product)

        })
        app.get('/dryfoods', async (req, res) => {
            const cursor = dryfoodsCollections.find({})
            const product = await cursor.toArray()
            res.send(product)

        })

        // Users section 
        // post user 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result)
        })
         // orders post 
         app.post('/orders', async (req, res) => {
            const order = req.body
            const result = await ordersCollection.insertOne(order)
            res.json(result)
        })
       
        app.get('/myorders', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const cursor = ordersCollection.find(query)
            const orders = await cursor.toArray()
            res.send(orders)

        })
        app.delete('/myorders/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            res.json(result)
        })
        app.get('/getorders', async (req, res) => {
            const cursor = ordersCollection.find({})
            const orders = await cursor.toArray()
            res.send(orders)
        })
        // message post 
        app.post('/messages', async (req, res) => {
            const message = req.body
            const result = await messagesCollection.insertOne(message)
            res.json(result)
        })

        // admin section 
         // make admin 
         app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        // checked admin or not 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })




        // admin 
        app.post('/addproduct', async(req, res) => {
            const name = req.body.name;
             const price = req.body.price;
            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const product = {
                name,
                price,
                img: imageBuffer
            }
            const result = await productsCollections.insertOne(product);
            res.json(result);  
        })
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await productsCollections.deleteOne(query)
            res.json(result)
        })
        app.put('/updateproduct/:id',async(req,res)=>{
            const id=req.params.id 
            const updatedProduct=req.body
            const filter={_id:ObjectId(id)}
            const option={upsert:true}
            const updateDoc={
                $set:{
                 name:updatedProduct.name,
                 price:updatedProduct.price,
                 img:updatedProduct.img,
                }
            }
            const result =await productsCollections.updateOne(filter,updateDoc,true)
            res.json(result)
        })
         // update orders 
         app.put('/updateorders/:id',async(req,res)=>{
            const id=req.params.id 
            const updatedStatus=req.body
            const filter={_id:ObjectId(id)}
            const option={upsert:true}
            const updateDoc={
                $set:{
                status:'Approved',  
                }
            }
            const result =await ordersCollection.updateOne(filter,updateDoc,true)
            res.json(result)
        })
       

    }
    finally {

    }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('vegHub is running under server')
})
app.listen(port, () => {
    console.log("server is running on", port)
})