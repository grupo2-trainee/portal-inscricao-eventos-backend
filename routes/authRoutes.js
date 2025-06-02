import express from "express"
import authClient from '../controllers/authClient.js'
import authAdmin from "../controllers/authAdmin.js"

const router = express.Router()

// ROTAS
router.post('/registerCliente', authClient.cadClient)
router.post('/loginCliente', authClient.logClient)
router.post('/registerAdmin', authAdmin.cadAdmin)
router.post('/loginAdmin', authAdmin.logAdmin)

export default router