const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());


const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jolmh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.get('/', function (req, res) {
  res.send('hello world')
})



const client = new MongoClient(uri, { useNewUrlParser: true ,useUnifiedTopology: true });

client.connect(err => {
  const appointmentCollection = client.db(process.env.DB_NAME).collection("appointments");


app.post('/addAppointment',(req, res)=>{
  const appointment=req.body;
  console.log(appointment);
  appointmentCollection.insertOne(appointment)
  .then(result=>{
    res.send(result.insertedCount>0)
  })
})
});        

app.listen(process.env.PORT || port);