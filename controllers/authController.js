const home = (req, res) =>{
    const { msg } = req.query
    res.status(200).json({
        mensagem: msg 
    })
}

export default {
    home,
}