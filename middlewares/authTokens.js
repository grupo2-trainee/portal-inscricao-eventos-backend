import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET || 'includeJr'

// AUTENTICAÇÃO DE LOGIN ADMIN
const authTokenAdmin = (req, res) => {
    const token = req.headers['authorization']   

    if (!token){
        res.status(401).json({ erro: 'Usuário não autenticado' })
    }

    const decodedToken = jwt.decode(token)

    if(decodedToken.type != "ADMIN"){
        res.status(403).json({erro: 'Autenticação negada'})
    }

    jwt.verify(token, JWT_SECRET, (err) => {
    if (err) {
        res.status(403).json({ erro: 'Token de autenticação inválido' })
    } 
    
    return res.status(200).json({
        redirectTo: '/',
    });
  });
};

// AUTENTICAÇÃO DE LOGIN CLIENTE
const authTokenClient = (req, res) => {
    const token = req.headers['authorization']   

    if (!token){
        res.status(401).json({ erro: 'Usuário não autenticado' })
    }

    const decodedToken = jwt.decode(token)

    if(decodedToken.type != "CLIENT"){
        res.status(403).json({erro: 'Autenticação negada'})
    }

    jwt.verify(token, JWT_SECRET, (err) => {
    if (err) {
        res.status(403).json({ erro: 'Token de autenticação inválido' })
    } 
    
    return res.status(200).json({
        redirectTo: '/',
    });
  });
};

export default{
    authTokenAdmin,
    authTokenClient
}