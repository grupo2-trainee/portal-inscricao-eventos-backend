import express from "express"
import authClient from '../controllers/authClient.js'
import authTokens from "../middlewares/authTokens.js"

const router = express.Router()

router.get('/home', authTokens.authToken, test.home) // APENAS PARA TESTES
router.post('/registerCliente', authClient.cadClient)

export default router