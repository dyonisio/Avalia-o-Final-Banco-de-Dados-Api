const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const { authRole, ROLE } = require('../middleware/authRoles');

router.get('/', authRole([ROLE.ADMIN, ROLE.FUNCIONARIO]), (req, res, next) => {
    const itemPedido = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT ip.*, p.descricao FROM itens_pedido ip INNER JOIN produto p WHERE p.idProduto = ip.idProduto',
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhum item de pedido'
                    });
                }

                for(var x = 0 in resultado){
                    itemPedido.push({
                        idPedido: resultado[x].idPedido,
                        idProduto: resultado[x].idProduto,
                        precoIndividual: resultado[x].precoIndividual,
                        quantidade: resultado[x].quantidade,
                        descricao: resultado[x].descricao
                    })
                }
                return res.status(200).send({ response: itemPedido });
            }
        )
    });
});

router.get('/:idPedido', authRole([ROLE.ALL]), (req, res, next) => {
    const id = req.params.idPedido
    const itemPedido = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT ip.*, p.descricao FROM itens_pedido ip INNER JOIN produto p ON p.idProduto = ip.idProduto WHERE idPedido = ?',
            [id],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhum item para este pedido'
                    });
                }

                for(var x = 0 in resultado){
                    itemPedido.push({
                        idPedido: resultado[x].idPedido,
                        idProduto: resultado[x].idProduto,
                        precoIndividual: resultado[x].precoIndividual,
                        quantidade: resultado[x].quantidade,
                        descricao: resultado[x].descricao
                    })
                }
                return res.status(200).send({ response: itemPedido });
            }
        )
    });
});

router.post('/', authRole([ROLE.ALL]), (req, res, next) => {
    const itemPedido = {
        idPedido: req.body.idPedido,
        idProduto: req.body.idProduto,
        quantidade: req.body.quantidade,
    }

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query('INSERT INTO `itens_pedido` (`idPedido`, `idProduto`, `quantidade`, `precoIndividual`) VALUES (?, ?, ?, (SELECT p.preco FROM produto p WHERE p.idProduto = ?));',
        [itemPedido.idPedido, itemPedido.idProduto, itemPedido.quantidade, itemPedido.idProduto], 
        (error, resultado) => {
            conn.release();
            if(error){return res.status(500).send({ error: error})};

            res.status(201).send({
                message: 'Item inserido ao pedido com sucesso!',
                createdItemPedido: itemPedido
            });
        });
    });
});

router.delete('/:idPedido/:idProduto', authRole([ROLE.ADMIN, ROLE.FUNCIONARIO]), (req, res, next) => {
    const idProduto = req.params.idProduto;
    const idPedido = req.params.idPedido;

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query('DELETE FROM `itens_pedido` WHERE `idProduto` = ? AND `idPedido` = ?;',
            [idProduto, idPedido],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};
    
                return res.status(201).send({
                    message: 'Item do Pedido deletado com sucesso!',
                });
            }
        )
    });
});


module.exports = router;