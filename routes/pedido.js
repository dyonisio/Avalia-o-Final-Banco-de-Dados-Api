const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const { authRole, ROLE } = require('../middleware/authRoles');

router.get('/', authRole([ROLE.ADMIN, ROLE.FUNCIONARIO]), (req, res, next) => {
    const pedido = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT p.*, sp.descricaoStatus FROM pedido p INNER JOIN status_pedido sp ON p.idStatusPedido = sp.idStatusPedido;',
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhum pedido'
                    });
                }

                for(var x = 0 in resultado){
                    pedido.push({
                        idPedido: resultado[x].idPedido,
                        idUsuario: resultado[x].idUsuario,
                        statusPedido: resultado[x].descricaoStatus,
                        dataPedido: resultado[x].dataPedido
                    })
                }
                return res.status(200).send({ response: pedido });
            }
        )
    });
});

router.get('/:idPedido', authRole([ROLE.ALL]), (req, res, next) => {
    const id = req.params.idPedido;
    const pedido = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT p.*, sp.descricaoStatus FROM pedido p INNER JOIN status_pedido sp ON p.idStatusPedido = sp.idStatusPedido WHERE idPedido = ?;',
            [id],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhum pedido'
                    });
                }

                for(var x = 0 in resultado){
                    pedido.push({
                        idPedido: resultado[x].idPedido,
                        idUsuario: resultado[x].idUsuario,
                        statusPedido: resultado[x].descricaoStatus,
                        dataPedido: resultado[x].dataPedido
                    })
                }
                return res.status(200).send({ response: pedido });
            }
        )
    });
});

router.get('/me/:idUsuario', authRole([ROLE.ALL]), (req, res, next) => {
    const id = req.params.idUsuario;
    const pedido = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT p.*, sp.descricaoStatus FROM pedido p INNER JOIN status_pedido sp ON p.idStatusPedido = sp.idStatusPedido WHERE idUsuario = ?',
            [id],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhum pedido'
                    });
                }

                for(var x = 0 in resultado){
                    pedido.push({
                        idPedido: resultado[x].idPedido,
                        idUsuario: resultado[x].idUsuario,
                        statusPedido: resultado[x].descricaoStatus,
                        dataPedido: resultado[x].dataPedido
                    })
                }
                return res.status(200).send({ response: pedido });
            }
        )
    });
});

router.post('/', authRole([ROLE.ALL]), (req, res, next) => {
    const pedido = {
        idPedido: null,
        idUsuario: req.usuario.idUsuario,
    }

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query('INSERT INTO `pedido` (`idPedido`, `idUsuario`) VALUES (NULL, ?);',
        [pedido.idUsuario], 
        (error, resultado) => {
            conn.release();
            if(error){return res.status(500).send({ error: error})};

            pedido.idPedido = resultado.insertId;

            res.status(201).send({
                message: 'Pedido criado com sucesso!',
                createdPedido: pedido
            });
        });
    });
});

router.get('/fecharpedido/:idPedido', authRole([ROLE.ALL]), (req, res, next) => {
    const id = req.params.idPedido;

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'UPDATE `pedido` SET `idStatusPedido` = ? WHERE `idPedido` = ?;',
            [3,id],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                return res.status(200).send({ message: 'Pedido efetuado com sucesso!' });
            }
        )
    });
});

router.get('/cancelarpedido/:idPedido', authRole([ROLE.ADMIN, ROLE.FUNCIONARIO]), (req, res, next) => {
    const id = req.params.idPedido;

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'UPDATE `pedido` SET `idStatusPedido` = ? WHERE `idPedido` = ?;',
            [1,id],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                return res.status(200).send({ message: 'Pedido cancelado com sucesso!' });
            }
        )
    });
});

router.get('/prepararpedido/:idPedido', authRole([ROLE.ADMIN, ROLE.FUNCIONARIO]), (req, res, next) => {
    const id = req.params.idPedido;

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'UPDATE `pedido` SET `idStatusPedido` = ? WHERE `idPedido` = ?;',
            [2,id],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                return res.status(200).send({ message: 'Pedido atualizado com sucesso!' });
            }
        )
    });
});

router.get('/enviarpedido/:idPedido', authRole([ROLE.ADMIN, ROLE.FUNCIONARIO]), (req, res, next) => {
    const id = req.params.idPedido;

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'UPDATE `pedido` SET `idStatusPedido` = ? WHERE `idPedido` = ?;',
            [6,id],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                return res.status(200).send({ message: 'Pedido atualizado com sucesso!' });
            }
        )
    });
});

router.get('/finalizarpedido/:idPedido', authRole([ROLE.ADMIN, ROLE.FUNCIONARIO]), (req, res, next) => {
    const id = req.params.idPedido;

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'UPDATE `pedido` SET `idStatusPedido` = ? WHERE `idPedido` = ?;',
            [4,id],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                return res.status(200).send({ message: 'Pedido finalizado com sucesso!' });
            }
        )
    });
});

module.exports = router;