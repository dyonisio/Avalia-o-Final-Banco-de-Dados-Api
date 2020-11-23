const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const { authRole, ROLE } = require('../middleware/authRoles');

router.get('/', authRole([ROLE.ALL]), (req, res, next) => {
    const quarto = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT q.*, tq.descricaoTipo, vg.numeroVaga FROM quarto q INNER JOIN tipo_quarto tq ON q.idTipoQuarto = tq.idTipoQuarto INNER JOIN vaga_garagem vg ON q.idVaga = vg.idVaga',
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhum quarto cadastrado'
                    });
                }

                for(var x = 0 in resultado){
                    quarto.push({
                        idQuarto: resultado[x].idQuarto,
                        bloco: resultado[x].bloco,
                        andar: resultado[x].andar,
                        numero: resultado[x].numero,
                        precoDiaria: resultado[x].precoDiaria,
                        descricaoTipo: resultado[x].descricaoTipo,
                        numeroVaga: resultado[x].numeroVaga,
                    })
                }
                return res.status(200).send({ response: quarto });
            }
        )
    });
});

router.post('/', authRole([ROLE.ADMIN, ROLE.FUNCIONARIO]), (req, res, next) => {
    const quarto = {
        idQuarto: null,
        idTipoQuarto: req.body.idTipoQuarto,
        idVaga: req.body.idVaga, 
        bloco: req.body.bloco, 
        andar: req.body.andar, 
        numero: req.body.numero,
        precoDiaria: req.body.precoDiaria,
    }

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query('SELECT * FROM quarto q WHERE q.bloco = ? AND q.andar = ? AND q.numero = ?',
        [quarto.bloco, quarto.andar, quarto.numero], (error, resultado) => {
            if(error){return res.status(500).send({ error: error})};
            if(resultado.length > 0){
                res.status(409).send({ error: 'Quarto já cadastrado'})
            } else {
                conn.query(
                    'INSERT INTO `quarto` (`idQuarto`, `idTipoQuarto`, `idVaga`, `bloco`, `andar`, `numero`, `precoDiaria`) VALUES (NULL, ?, ?, ?, ?, ?, ?);',
                    [quarto.idTipoQuarto, quarto.idVaga, quarto.bloco, quarto.andar, quarto.numero, quarto.precoDiaria],
                    (error, resultado, field) => {
                        conn.release();
                        if(error){return res.status(500).send({ error: error})};
                        quarto.idQuarto = resultado.insertId;
                                        
                        res.status(201).send({
                            message: 'Quarto cadastrado com sucesso!',
                            createdQuarto: quarto
                        });
                    }
                )
            }
        });
    });
});

module.exports = router;