const jwt = require('jsonwebtoken');

const ROLE = {
    ADMIN: 'admin',
    FUNCIONARIO: 'funcionario',
    CLIENTE: 'cliente'
}

function authRole(role){
    return (req, res, next) => {
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.JWT_KEY);
        var roleChecked = false;

        for(var x = 0 in role){
            console.log(role[x]);
            if(decode.role = role[x]){
                roleChecked = true;
            }
        }

        if(!roleChecked){
            return res.status(401).send({ error: "Não autorizado"});
        }

        req.usuario = decode;    
        next();     
    }
}

module.exports = {
    authRole
}