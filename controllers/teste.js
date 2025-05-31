import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET || 'includeJr'

const home = (req, res) =>{
    const { refreshToken } = req.body

    if(!refreshToken){
        return res.status(403).json({erro: 'Usuário não autenticado.'})
    }

    let admin
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        if(decodedToken.type != "ADMIN"){
            return res.status(403).json({ erro: 'Token inválido.' })
        }

    } catch (err) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' })
    }
    
    res.status(200).json({
        mensagem: 'OK' 
    })
}

export default {
    home,
}