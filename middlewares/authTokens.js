import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET

const authToken = (req, res, next) => {
    const authHeader = req.headers['authorization']   
    const token = authHeader?.split(' ')[1]

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