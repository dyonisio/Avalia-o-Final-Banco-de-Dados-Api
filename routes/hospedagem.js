const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).send({
        mensagem: 'Usando o Get dentro da rota de Hospedagem'
    });
});

router.post('/', (req, res, next) => {
    res.status(200).send({
        mensagem: 'Usando o Post dentro da rota de Hospedagem'
    });
});

module.exports = router;