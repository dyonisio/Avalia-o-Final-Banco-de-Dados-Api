const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const { authRole, ROLE } = require('../middleware/authRoles');

/**
 * @swagger
 * /api/user/:
 *  get:
 *    description: Retorna todos os usuarios
 *    responses:
 *      '200':
 *          description: 'Usuario retornado'
 *      '404':
 *          description: 'Não foi encontrado nenhum usuario'
 *      '500':
 *          description: 'Internal Error'
 */
router.get('/', authRole(['admin', 'funcionario', 'cliente']), (req, res, next) => {
    const usuario = [];
    const endereco = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT * FROM usuario u INNER JOIN endereco e ON u.idEndereco = e.idEndereco',
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhum usuario'
                    });
                }

                for(var x = 0 in resultado){
                    endereco.push({
                        idEndereco: resultado[x].idEndereco,
                        identificador: resultado[x].identificador,
                        rua: resultado[x].rua,
                        numero: resultado[x].numero,
                        bairro: resultado[x].bairro,
                        cidade: resultado[x].cidade,
                        cep: resultado[x].cep,
                        estado: resultado[x].estado
                    })

                    usuario.push({
                        idUsuario: resultado[x].idUsuario,
                        nome: resultado[x].nome,
                        cpf: resultado[x].cpf,
                        celular: resultado[x].celular,
                        endereco: endereco[x]
                    });
                }
                return res.status(200).send({ response: usuario });
            }
        )
    });
});

//RETORNA O USUARIO LOGADO
router.get('/me', authRole([ROLE.ALL]), (req, res, next) => {
    const idUsuario = req.usuario.idUsuario;

    const usuario = [];
    const endereco = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT * FROM usuario u INNER JOIN endereco e ON e.idEndereco = u.idEndereco WHERE u.idUsuario = ?',
            [idUsuario],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhum usuario com esse ID'
                    });
                }

                for(var x = 0 in resultado){
                    endereco.push({
                        idEndereco: resultado[x].idEndereco,
                        identificador: resultado[x].identificador,
                        rua: resultado[x].rua,
                        numero: resultado[x].numero,
                        bairro: resultado[x].bairro,
                        cidade: resultado[x].cidade,
                        cep: resultado[x].cep,
                        estado: resultado[x].estado
                    })

                    usuario.push({
                        idUsuario: resultado[x].idUsuario,
                        nome: resultado[x].nome,
                        cpf: resultado[x].cpf,
                        celular: resultado[x].celular,
                        endereco: endereco[x]
                    });
                }
                return res.status(200).send({ response: usuario });
            }
        )
    });
});

//RETORNA UM USUARIO ESPECIFICO
router.get('/:idUsuario', authRole(['admin', 'funcionario']), (req, res, next) => {
    const id = req.params.idUsuario

    const usuario = [];
    const endereco = [];

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'SELECT * FROM usuario u INNER JOIN endereco e ON e.idEndereco = u.idEndereco WHERE u.idUsuario = ?',
            [id],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};

                if(resultado.length == 0){
                    return res.status(404).send({
                        error: 'Não foi encontrado nenhum usuario com esse ID'
                    });
                }

                for(var x = 0 in resultado){
                    endereco.push({
                        idEndereco: resultado[x].idEndereco,
                        identificador: resultado[x].identificador,
                        rua: resultado[x].rua,
                        numero: resultado[x].numero,
                        bairro: resultado[x].bairro,
                        cidade: resultado[x].cidade,
                        cep: resultado[x].cep,
                        estado: resultado[x].estado
                    })

                    usuario.push({
                        idUsuario: resultado[x].idUsuario,
                        nome: resultado[x].nome,
                        cpf: resultado[x].cpf,
                        celular: resultado[x].celular,
                        endereco: endereco[x]
                    });
                }
                return res.status(200).send({ response: usuario });
            }
        )
    });
});

//CADASTRA UM USUARIO
router.post('/', (req, res, next) => {
    const endereco = {
        idEndereco: null,
        identificador: req.body.identificador, 
        rua: req.body.rua, 
        numero: req.body.numero, 
        complemento: req.body.complemento,
        bairro: req.body.bairro,
        cidade: req.body.cidade,
        cep: req.body.cep,
        estado: req.body.estado
    }

    const usuario = {
        idUsuario: null,
        nome: req.body.nome,
        cpf: req.body.cpf,
        celular: req.body.celular,
        endereco: endereco
    }

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query('SELECT * FROM usuario WHERE cpf = ?',[req.body.cpf], (error, resultado) => {
            if(error){return res.status(500).send({ error: error})};
            if(resultado.length > 0){
                res.status(409).send({ error: 'CPF já utilizado'})
            } else {
                conn.query(
                    'INSERT INTO `endereco` (`idEndereco`, `identificador`, `rua`, `numero`, `complemento`, `bairro`, `cidade`, `cep`, `estado`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?);',
                    [endereco.identificador, endereco.rua, endereco.numero, endereco.complemento, endereco.bairro, endereco.cidade, endereco.cep, endereco.estado],
                    (error, resultado, field) => {
                        if(error){return res.status(500).send({ error: error})};
                        endereco.idEndereco = resultado.insertId;   

                        bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                            if(errBcrypt){return res.status(500).send({ error: errBcrypt })}
            
                            conn.query(
                                'INSERT INTO `usuario` (`idUsuario`, `nome`, `cpf`, `senha`, `celular`, `idEndereco`) VALUES (NULL, ?, ?, ?, ?, ?);',
                                [usuario.nome, usuario.cpf, hash, usuario.celular, endereco.idEndereco],
                                (error, resultado, field) => {
                                    conn.release();
                                    if(error){return res.status(500).send({ error: error})};
            
                                    usuario.idUsuario = resultado.insertId;
                                        
                                    res.status(201).send({
                                        message: 'Usuario cadastrado com sucesso!',
                                        items: usuario
                                    });
                                }
                            )
                        });
                    }
                )
            }
        });
    });
});

//DELETA UM USUARIO
router.delete('/:idUsuario', authRole(['admin', 'funcionario']), (req, res, next) => {
    const id = req.params.idUsuario

    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({ error: error})};

        conn.query(
            'DELETE u.*, e.* FROM usuario u INNER JOIN endereco e ON u.idEndereco = e.idEndereco WHERE u.idUsuario = ?;',
            [id],
            (error, resultado, field) => {
                conn.release();
                if(error){return res.status(500).send({ error: error})};
    
                return res.status(201).send({
                    message: 'Usuario deletado com sucesso!',
                });
            }
        )
    });
});

module.exports = router;