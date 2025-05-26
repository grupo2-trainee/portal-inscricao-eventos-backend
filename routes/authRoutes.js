import express from "express"
import test from "../controllers/teste.js"
import authAdmin from "../controllers/authAdmin.js"
import authTokens from "../middlewares/authTokens.js"

const router = express.Router()

router.get('/home', authTokens.authToken, test.home) // APENAS PARA TESTES
router.post('/registerAdmin', authAdmin.cadAdmin)
router.post('/loginAdmin', authAdmin.logAdmin)
router.post('/refresh',authAdmin.refreshTokenAdmin) 

export default router