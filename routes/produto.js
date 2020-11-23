const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const { authRole, ROLE } = require('../middleware/authRoles');

router.get('/', authRole([ROLE.ALL]), (req, res, next) => {
    const produto = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT * FROM produto',
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhum produto cadastrado'
                    });
                }

                for(var x = 0 in resultado){
                    produto.push({
                        idProduto: resultado[x].idProduto,
                        descricao: resultado[x].descricao,
                        preco: resultado[x].preco
                    })
                }
                return res.status(200).send({ response: produto });
            }
        )
    });
});

router.post('/', authRole([ROLE.ADMIN, ROLE.FUNCIONARIO]), (req, res, next) => {
    const produto = {
        idProduto: null,
        descricao: req.body.descricao,
        preco: req.body.preco
    }

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query('INSERT INTO `produto` (`idProduto`, `descricao`, `preco`) VALUES (NULL, ?, ?);',
        [produto.descricao, produto.preco], 
        (error, resultado) => {
            conn.release();
            if(error){return res.status(500).send({ error: error})};

            produto.idProduto = resultado.insertId;

            res.status(201).send({
                message: 'Produto cadastrado com sucesso!',
                createdProduto: produto
            });
        });
    });
});

router.delete('/:idProduto', authRole([ROLE.ADMIN, ROLE.FUNCIONARIO]), (req, res, next) => {
    const id = req.params.idProduto

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query('DELETE FROM `produto` WHERE `idProduto` = ?;',
            [id],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};
    
                return res.status(201).send({
                    message: 'Produto deletado com sucesso!',
                });
            }
        )
    });
});


module.exports = router;