const express = require("express");
var cors = require('cors');
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
require('dotenv').config();

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
const financeiroRoutes = require('./routes/financeiroRoutes');
const credito = require("./controllers/CreditoController.js");
const consulta = require("./routes/consultaRoutes");
const { authenticationMiddleware, authenticationMiddlewareApi } = require('./middlewares/authentication.js');

var corsOptions = {
origin: [process.env.ORIGIN1, process.env.ORIGIN2, process.env.ORIGIN3],
optionsSuccessStatus: 200
}

const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());

app.use("/auth", cors(corsOptions), auth);
app.use("/users", cors(corsOptions), authenticationMiddleware, users);
app.use("/rh", cors(corsOptions), authenticationMiddleware, rh);
app.use("/qualidade", cors(corsOptions), authenticationMiddleware, qualidade);
app.use("/chamados", cors(corsOptions), authenticationMiddleware, chamados);
app.use("/korp", cors(corsOptions), authenticationMiddleware, korp);
app.use("/engenharia", cors(corsOptions), authenticationMiddleware, engenharia);
app.use("/totvs", cors(corsOptions), authenticationMiddlewareApi, totvs);
app.use("/comercial", cors(corsOptions), authenticationMiddleware, comercial);
app.use('/financeiro', cors(corsOptions), authenticationMiddleware, financeiroRoutes);
app.use("/credito", cors(corsOptions),  credito);
app.use("/files", cors(corsOptions), files);
app.use("/consultas", cors(corsOptions), authenticationMiddlewareApi, consulta);

app.listen(5000, function () {
    console.log("Node.js working in port 5000");
});
