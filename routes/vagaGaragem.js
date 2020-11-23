const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const { authRole, ROLE } = require('../middleware/authRoles');

router.get('/', authRole([ROLE.ALL]), (req, res, next) => {
    const vagaGaragem = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT * FROM vaga_garagem',
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhuma vaga cadastrada na garagem'
                    });
                }

                for(var x = 0 in resultado){
                    vagaGaragem.push({
                        idVaga: resultado[x].idVaga,
                        numeroVaga: resultado[x].numeroVaga,
                        ocupada: Boolean(Number(resultado[x].ocupada))
                    })
                }
                return res.status(200).send({ response: vagaGaragem });
            }
        )
    });
});

router.post('/', authRole([ROLE.ADMIN, ROLE.FUNCIONARIO]), (req, res, next) => {
    const vagaGaragem = {
        idVaga: null,
        ocupada: req.body.ocupada,
        numeroVaga: req.body.numerovaga
    }

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query('INSERT INTO `vaga_garagem` (`idVaga`, `ocupada`, `numeroVaga`) VALUES (NULL, ?, ?);',
        [vagaGaragem.ocupada, vagaGaragem.numeroVaga], 
        (error, resultado) => {
            if(error){return res.status(500).send({ error: error})};

            vagaGaragem.idVaga = resultado.insertId;

            res.status(201).send({
                message: 'Vaga na garagem cadastrada com sucesso!',
                createdVagaGaragem: vagaGaragem 
            });
        });
    });
});

router.delete('/:idVaga', authRole([ROLE.ADMIN, ROLE.FUNCIONARIO]), (req, res, next) => {
    const id = req.params.idVaga

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query('DELETE FROM `vaga_garagem` WHERE `idVaga` = ?;',
            [id],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};
    
                return res.status(201).send({
                    message: 'Vaga na Garagem deletada com sucesso!',
                });
            }
        )
    });
});

module.exports = router;