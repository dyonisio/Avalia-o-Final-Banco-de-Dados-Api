const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const defaultPath = '/api';

// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'HotelAmbra API',
            description: 'API feita para um hotel ficticio para a matéria de Banco de Dados',
            contact: {
                name: 'Mateus Dyonsiio',
                url: 'http://mdyonisio.com.br',
                email: 'contato@mdyonisio.com.br'
            }
        }
    },
    apis: ['./routes/*.js']
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const rotaQuarto = require('./routes/quarto');
const rotaTipoQuarto = require('./routes/tipoQuarto');
const rotaProduto = require('./routes/produto');
const rotaVagaGaragem = require('./routes/vagaGaragem');
const rotaHospedagem = require('./routes/hospedagem');
const rotaUser = require('./routes/user');
const rotaAuth = require('./routes/auth');
const rotaItensPedido = require('./routes/itensPedido');    
const rotaPedido = require('./routes/pedido');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false})); // apenas dados simples
app.use(bodyParser.json()); // json de entrada

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Header',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );

    if(res.method == 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT', 'POST', 'PATCH', 'DELETE', 'GET');
        return res.status(200).send({});
    }

    next();
});

app.use(defaultPath+'/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(defaultPath+'/quarto', rotaQuarto);
app.use(defaultPath+'/tipoquarto', rotaTipoQuarto);
app.use(defaultPath+'/vagagaragem', rotaVagaGaragem);
app.use(defaultPath+'/hospedagem', rotaHospedagem);
app.use(defaultPath+'/user', rotaUser);
app.use(defaultPath+'/auth', rotaAuth);
app.use(defaultPath+'/produto', rotaProduto);
app.use(defaultPath+'/itenspedido', rotaItensPedido);
app.use(defaultPath+'/pedido', rotaPedido);

//Rota não encontrada
app.use((req, res, next) =>{
    const erro = new Error('Rota não encontrada');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    return res.send({
        error: {
            message: error.message
        }
    });
});

module.exports = app;