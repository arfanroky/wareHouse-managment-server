const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

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
    
        app.get('/perfume', async (req, res) =>{
           const query = {};
           const cursor = perfumeCollection.find(query);

           const perfumes = await cursor.toArray();

           res.send(perfumes);
        })
    
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