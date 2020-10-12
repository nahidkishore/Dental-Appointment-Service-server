const express = require("express");

const port = 5000;
const bodyParser = require("body-parser");
const cors = require("cors");
const fs=require("fs-extra");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jolmh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("doctors"));
app.use(fileUpload());

app.get("/", function (req, res) {
  res.send("hello world");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const appointmentCollection = client
    .db(process.env.DB_NAME)
    .collection("appointments");
  const doctorCollection = client.db(process.env.DB_NAME).collection("doctors");

  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    console.log(appointment);
    appointmentCollection.insertOne(appointment).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  //all patients list
  app.get("/AllPatients", (req, res) => {
    appointmentCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/appointmentsByDate", (req, res) => {
    const date = req.body;
    const email = req.body.email;
    doctorCollection.find({ email: email }).toArray((err, doctors) => {
      const filter = { date: date.date };
      if (doctors.length === 0) {
        filter.email = email;
      }
      appointmentCollection.find(filter).toArray((err, documents) => {
        console.log(email, date.date, doctors, documents);
        res.send(documents);
      });
    });
  });

  app.get("/doctors", (req, res) => {
    doctorCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addADoctor", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;

    // console.log(file, name, email);
   /*  const filePath =`${__dirname}/doctors/${file.name}` */
 /*    file.mv(filePath,err => {
      if(err){
        console.log(err);
         res.status(500).send({msg: 'failed to upload'})
      } */

      const newImg=file.data;
      const encImg = newImg.toString("base64");

      var image = {
        contentType: file.mimetype,
        size:file.size,
        img: Buffer.from(encImg, "base64"),
      };
  

      doctorCollection.insertOne({name,email,image})
      .then((result) => {
       /*  fs.remove(filePath,error=>{
          if(error){
            console.log(error);
            res.status(500).send({msg: 'failed to upload'})
          } */
        //})
        res.send(result.insertedCount > 0);
      });

    //})
  });
 

  app.post('/isDoctor', (req, res) => {
    const email = req.body.email;
    doctorCollection.find({ email: email })
        .toArray((err, doctors) => {
            res.send(doctors.length > 0);
        })
})
});

app.listen(process.env.PORT || port);
