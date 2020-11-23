const express = require('express');
const router = express.Router();

router.get('/diaria', (req, res, next) => {
    res.status(200).send({
        mensagem: 'Usando o Get dentro da rota de Hotel'
    });
});

router.post('/', (req, res, next) => {
    res.status(200).send({
        mensagem: 'Usando o Post dentro da rota de Hotel'
    });
});

module.exports = router;