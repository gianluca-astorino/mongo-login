//defining applications necessities
const {
    response
  } = require("express");
  var express = require("express");
  const session = require('express-session');
  const {
    render,
    name
  } = require("ejs");
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  const {
    resolveSoa,
    CONNREFUSED
  } = require("dns");
  const {
    Console
  } = require("console");

//DEFINING APP SETTINGS
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.static(__dirname + "/public"));
app.use("/public/css/images", express.static("./public/css/images"));
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);
//manage sessions
app.use(session({
    secret: 'xxx',
    resave: false,
    saveUninitialized: false,
}))

const { authCheck, adminCheck } = require("../common");

//mongo info
let {MongoClient} = require("mongodb")
const uri = 'xxx'
const client = new MongoClient(uri)


app.get('/login', authCheck, async(req, res) => {
    res.render('login.ejs')
})

app.post('/login', authCheck, async (req, res) => {

    const database = client.db("Cluster0");
    const people = database.collection("people");

    let loginDetails = req.body

    MongoClient.connect(uri, async function(err, db) {
        if (err) throw err;
        people.find({'email': loginDetails.email}).toArray(function(e,doc){
            if(doc.length === 0) {
                res.send('No record found.');
            } else {
                let hashed_pw = ""
                for (var i = 0; i < doc.length; i++) {
                    hashed_pw = doc[i].password
                }
              
                bcrypt.compare(loginDetails.password, hashed_pw, async function(err, result) {
                    if (result === true) {
                        req.session.loggedin = true
                        res.redirect('/dashboard')
                    } else {
                        res.send("incorrect password")
                    }
                })
            }
            db.close();
        });
    })

})

app.get('/logout', async (req, res) => {
    req.session.destroy()
    res.redirect('/login')
})

// this function is defined within a common.js file in the root directory of said project.
// for ease of viewing, I put it in here

function authCheck(req, res, next() {
   if (req.session.loggedin) {
    next()
   } else {
    req.session.destroy()
    res.render('login.ejs')
   }
},

module.exports = app;
