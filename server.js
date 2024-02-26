const express = require("express");
var cors = require('cors');
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken')

const users = require("./controllers/usersController.js");
const qualidade = require("./controllers/qualidadeController.js");
const chamados = require("./controllers/chamadosController.js");
const rh = require("./controllers/rhController.js");
const auth = require("./controllers/authController.js");
const totvs = require("./controllers/apisTotvsController.js");
const korp = require("./controllers/korpController.js");
const engenharia = require("./controllers/engenhariaController.js");
const comercial = require("./controllers/comercialController.js");
const files = require("./controllers/filesController.js");

var corsOptions = {
origin: [process.env.ORIGIN1, process.env.ORIGIN2, process.env.ORIGIN3],
optionsSuccessStatus: 200
}

const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());

function authenticationMiddleware(req, res, next){
    try {
        const token = req.headers.authorization.replace('jwt=', '');
        if(token){
            jwt.verify(token, process.env.JWTSECRET, (err)=>{
              if(err){
                  res.sendStatus(401)
              } else {
                next();
              }
            })
          }else{
              res.sendStatus(401)
          }
    } catch (error) {
        console.log(error)
        res.sendStatus(401)
    }
}

function authenticationMiddlewareApi(req, res, next){
    try {
        let token = req.headers.authorization.replace('jwt=', '');
        token = token.replace('Bearer ', '');
        if(token){
            jwt.verify(token, process.env.JWTSECRET, (err)=>{
              if(err){
                  res.sendStatus(401)
              } else {
                next();
              }
            })
          }else{
              res.sendStatus(401)
          }
    } catch (error) {
        console.log(error)
        res.sendStatus(401)
    }
}

app.use("/auth", cors(corsOptions), auth);
app.use("/users", cors(corsOptions), authenticationMiddleware, users);
app.use("/rh", cors(corsOptions), authenticationMiddleware, rh);
app.use("/qualidade", cors(corsOptions), authenticationMiddleware, qualidade);
app.use("/chamados", cors(corsOptions), authenticationMiddleware, chamados);
app.use("/korp", cors(corsOptions), authenticationMiddleware, korp);
app.use("/engenharia", cors(corsOptions), authenticationMiddleware, engenharia);
app.use("/totvs", cors(corsOptions), authenticationMiddlewareApi, totvs);
app.use("/comercial", cors(corsOptions), authenticationMiddleware, comercial);
app.use("/files", cors(corsOptions), files);


app.listen(5000, function () {
    console.log("Node.js working in port 5000");
});