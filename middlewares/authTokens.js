import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET || 'includeJr'

const authToken = (req, res, next) => {
    const token = req.headers['authorization']   

    if (!token){
        res.status(401).json({ erro: 'Usuário não autenticado' })
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
    authToken
}