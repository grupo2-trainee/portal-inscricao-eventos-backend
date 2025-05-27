import express from "express"
import authClient from '../controllers/authClient.js'
import authAdmin from "../controllers/authAdmin.js"

const router = express.Router()

// ROTAS
router.post('/registerCliente', authClient.cadClient)
router.post('/loginCliente', authClient.logClient)
router.post('/refreshCliente', authClient.refreshTokenClient)
router.post('/logoutCliente', authClient.logoutClient)
router.post('/registerAdmin', authAdmin.cadAdmin)
router.post('/loginAdmin', authAdmin.logAdmin)
router.post('/refreshAdmin',authAdmin.refreshTokenAdmin)
router.post('/logoutAdmin',authAdmin.logoutAdmin)

export default router