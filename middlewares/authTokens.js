import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET || 'includeJr'

// AUTENTICAÇÃO DE LOGIN ADMIN
const authTokenAdmin = (req, res, next) => {
    const token = req.headers['authorization']   

    if (!token){
        res.status(401).json({ erro: 'Usuário não autenticado' })
    }

    const decodedToken = jwt.decode(token)

    if(decodedToken.type != "ADMIN"){
        res.status(403).json({erro: 'Autenticação negada'})
    }

    jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) {
        res.status(403).json({ erro: 'Token de autenticação inválido' })
    } 
    
    req.usuario = usuario
    next()
  });
};

// AUTENTICAÇÃO DE LOGIN CLIENTE
const authTokenClient = (req, res, next) => {
    const token = req.headers['authorization']   

    if (!token){
        res.status(401).json({ erro: 'Usuário não autenticado' })
    }

    const decodedToken = jwt.decode(token)

    if(decodedToken.type != "CLIENT"){
        res.status(403).json({erro: 'Autenticação negada'})
    }

    jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) {
        res.status(403).json({ erro: 'Token de autenticação inválido' })
    } 
    
    req.usuario = usuario
    next()
  });
};

export default{
    authTokenAdmin,
    authTokenClient
}