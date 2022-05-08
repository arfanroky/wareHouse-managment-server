const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

//Middle Ware
app.use(cors());
app.use(express.json());
require('dotenv').config()




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9ldp2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const perfumeCollection = client.db('perfumeStores').collection('perfume');
        // const uploadCollection = client.db('perfumeStores').collection('uploadPerfume');

        app.post('/login', async (req, res) => {
            const email = req.body;
            const token = jwt.sign(email, process.env.DB_ACCESS_TOKEN);
            res.send({token});
            console.log(token);
        })
        
    
        app.get('/perfume', async (req, res) =>{
           const query = {};
           const cursor = perfumeCollection.find(query);
           const perfumes = await cursor.toArray();
           res.send(perfumes);
        });

        app.get('/perfume/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await perfumeCollection.findOne(query);
            res.send(result);
        })


        app.get('/perfume', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const cursor =  perfumeCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/addItem', async(req, res) => {
            const getItem = req.body;
            const result = perfumeCollection.insertOne(getItem);
            res.send({success: "Added Successfully"})
        });


        app.put('/perfume/:id', async (req, res) => {
            const id = req.params.id;
            const getQuantity = req.body.quantity;
            const filter = {_id: ObjectId(id)};
            const option = {upsert: true}
            const decreaseQuantity = {
                $set:{
                    quantity: getQuantity
                }
            }
            const updateQuantity = await perfumeCollection.updateOne(filter, decreaseQuantity, option);

            res.send({updateQuantity}) 
        });

        app.delete('/perfume/:id', async(req, res)  => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await perfumeCollection.deleteOne(query);
            res.send(result);
        })

        // app.delete('/uploadPerfume/:id', async(req, res)  => {
        //     const id = req.params.id;
        //     const query = {_id: ObjectId(id)};
        //     const result = await perfumeCollection.deleteOne(query);
        //     res.send(result);
        // })

    
    }
    finally{}
}

run().catch(console.dir)



app.get('/', (req, res) =>{
    res.send('Hello from perfume stores with heroku server')
})

app.get('/hero', (req, res) => {
    res.send('Hero meet heroku')
})

app.listen(port, () =>{
    console.log('Listening the port', port);
})
