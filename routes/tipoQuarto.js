const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const { authRole, ROLE } = require('../middleware/authRoles');

router.get('/', authRole([ROLE.ALL]), (req, res, next) => {
    const tipoQuarto = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT * FROM tipo_quarto',
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhum tipo de quarto cadastrado'
                    });
                }

                for(var x = 0 in resultado){
                    tipoQuarto.push({
                        idTipoQuarto: resultado[x].idTipoQuarto,
                        descricaoTipo: resultado[x].descricaoTipo,
                    })
                }
                return res.status(200).send({ response: tipoQuarto });
            }
        )
    });
});

router.post('/', authRole([ROLE.ADMIN, ROLE.FUNCIONARIO]), (req, res, next) => {
    const tipoQuarto = {
        idTipoQuarto: null,
        descricaoTipo: req.body.descricaoTipo
    }

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query('INSERT INTO `tipo_quarto` (`idTipoQuarto`, `descricaoTipo`) VALUES (NULL, ?);',
        [tipoQuarto.descricaoTipo], 
        (error, resultado) => {
            conn.release();
            if(error){return res.status(500).send({ error: error})};

            tipoQuarto.idTipoQuarto = resultado.insertId;

            res.status(201).send({
                message: 'Tipo de Quarto cadastrado com sucesso!',
                createdTipoQuarto: tipoQuarto
            });
        });
    });
});

router.delete('/:idTipoQuarto', authRole([ROLE.ADMIN, ROLE.FUNCIONARIO]), (req, res, next) => {
    const id = req.params.idTipoQuarto

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query('DELETE FROM `tipo_quarto` WHERE `idTipoQuarto` = ?;',
            [id],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};
    
                return res.status(201).send({
                    message: 'Tipo de Quarto deletado com sucesso!',
                });
            }
        )
    });
});


module.exports = router;