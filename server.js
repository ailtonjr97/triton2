const express = require("express");
var cors = require('cors');
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const users = require("./controllers/usersController.js");
const qualidade = require("./controllers/qualidadeController.js");
const chamados = require("./controllers/chamadosController.js");
const rh = require("./controllers/rhController.js");
const auth = require("./controllers/authController.js");
const totvs = require("./controllers/apisTotvsController.js");
const korp = require("./controllers/korpController.js");
const engenharia = require("./controllers/engenhariaController.js");
const nf = require("./routes/nfRoutes.js");
const comercial = require("./controllers/comercialController.js");
const compras = require("./controllers/comprasController.js");

const files = require("./controllers/filesController.js");
const financeiroRoutes = require('./routes/financeiroRoutes');
const logisticaRoutes = require("./routes/logisticaRoutes.js");
const credito = require("./controllers/CreditoController.js");
const consulta = require("./routes/consultaRoutes");
const { 
    authenticationMiddleware, 
    authenticationMiddlewareApi, 
    authenticationMiddlewareBasic, 
    authenticationMiddlewareFiles } = require('./middlewares/authentication.js');

var corsOptions = {
origin: [process.env.ORIGIN1, process.env.ORIGIN2, process.env.ORIGIN3, process.env.ORIGIN4, process.env.ORIGIN5],
credentials: true,
optionsSuccessStatus: 200
}

const app = express();

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/auth", cors(corsOptions), auth);
app.use("/users", cors(corsOptions), authenticationMiddleware, users);
app.use("/rh", cors(corsOptions), authenticationMiddleware, rh);
app.use("/qualidade", cors(corsOptions), authenticationMiddleware, qualidade);
app.use("/chamados", cors(corsOptions), authenticationMiddleware, chamados);
app.use("/korp", cors(corsOptions), authenticationMiddleware, korp);
app.use("/engenharia", cors(corsOptions), authenticationMiddleware, engenharia);
app.use("/totvs", cors(corsOptions), authenticationMiddlewareApi, totvs);
app.use("/nf", cors(corsOptions),  authenticationMiddleware, nf);
app.use("/comercial", cors(corsOptions), authenticationMiddleware, comercial);
app.use("/compras", cors(corsOptions), authenticationMiddleware, compras);
app.use('/financeiro', cors(corsOptions), authenticationMiddleware, financeiroRoutes);
app.use('/logistica', cors(corsOptions), logisticaRoutes);
app.use("/credito", cors(corsOptions),  credito);
app.use("/consulta", cors(corsOptions), authenticationMiddleware, consulta);
app.use("/consultas", cors(corsOptions), authenticationMiddlewareBasic, consulta);
app.use("/files", cors(corsOptions), files);
app.use("/qualidade-home", cors(corsOptions), authenticationMiddlewareFiles, qualidade);

app.listen(5000, function () {
    console.log("Node.js working in port 5000");
});

const enviarAprovacoesCompras = require("./jobs/enviarAprovacoesCompras");

// Executa imediatamente e depois a cada minuto
enviarAprovacoesCompras();
setInterval(enviarAprovacoesCompras, 60 * 1000);