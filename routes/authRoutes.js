import express from "express"
import test from "../controllers/teste.js"
import authClient from '../controllers/authClient.js'
import authAdmin from "../controllers/authAdmin.js"
import authTokens from "../middlewares/authTokens.js"

const router = express.Router()

// ROTAS
router.get('/home', authTokens.authToken, test.home) // APENAS PARA TESTES
router.post('/registerCliente', authClient.cadClient)
router.post('/loginCliente', authClient.logClient)
router.post('/refreshCliente', authClient.refreshTokenClient)
router.post('/logoutCliente', authClient.logoutClient)
router.post('/registerAdmin', authAdmin.cadAdmin)
router.post('/loginAdmin', authAdmin.logAdmin)
router.post('/refreshAdmin',authAdmin.refreshTokenAdmin)
router.post('/logoutAdmin',authAdmin.logoutAdmin)

export default router