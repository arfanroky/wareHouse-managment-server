const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cors = require('cors');

//Middle Ware
app.use(express.json());
require('dotenv').config()
app.use(cors());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9ldp2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const perfumeCollection = client.db('perfumeStores').collection('perfume');
        const uploadCollection = client.db('perfumeStores').collection('uploadPerfume');

        
        //Auth
        app.post('/login', async (req, res) => {
            const email = req.body;
            console.log(email);
            const token = await jwt.sign(email, process.env.DB_ACCESS_TOKEN, {
                expiresIn:'4d'
            });
            res.send({token});
            console.log(token);
        })

        // get perfume
        app.get('/perfume', async (req, res) => {
            const query = {};
            const cursor = perfumeCollection.find(query);
            const perfumes = await cursor.toArray();
            res.send(perfumes);
        });

        // single perfume
        app.get('/perfume/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await perfumeCollection.findOne(query);
            res.send(result);
        })

        // update quantity
        app.put('/perfume/:id', async (req, res) => {
            const id = req.params.id;
            const getQuantity = req.body.quantity;
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true }
            const decreaseQuantity = {
                $set: {
                    quantity: getQuantity
                }
            }
            const updateQuantity = await perfumeCollection.updateOne(filter, decreaseQuantity, option);

            res.send({ updateQuantity })
        });

        
        // inventories delete
        app.delete('/perfume/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await perfumeCollection.deleteOne(query);
            res.send(result);
        })

        /*
        ------------------
        */

        // add new item
        app.post('/addItem', async (req, res) => {
            const getItem = req.body;
            const result = uploadCollection.insertOne(getItem);
            res.send({ success: "Added Successfully" })
        });

        // get email address
        app.get('/uploadPerfume', jwtWithVerify, async (req, res) => {
        const decodedEmail = req.decoded.email;
        const email = req.query.email;

        if(decodedEmail === email){ 
        const query = { email: email };
        const cursor = uploadCollection.find(query)
        const result = await cursor.toArray();
        res.send(result)
            }
            else{
                res.status.send({message:'forbidden access'})
            }
        })

        // upload delete
        app.delete('/uploadPerfume/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await uploadCollection.deleteOne(query);
            res.send(result);
        })


    }
    finally { }
}

run().catch(console.dir)


const jwtWithVerify = (req, res, next) => {
    const tokenAuth = req.headers.authorization;
    console.log(tokenAuth);
    if(!tokenAuth){
        return res.status(401).send({message:'unauthorized access'});
    }
    const token = tokenAuth.split(' ')[1];
    console.log(token);

    jwt.verify(token, process.env.DB_ACCESS_TOKEN, (err, decoded) => {
        if(err){
            return res.status(403).send({message:'forbidden access'})
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
    })

    next();
} 


app.get('/', (req, res) => {
    res.send('Hello from perfume stores with heroku server')
})

app.get('/hero', (req, res) => {
    res.send('Hero meet heroku')
})

app.listen(port, () => {
    console.log('Listening the port', port);
})