import express from "express"
import authClient from '../controllers/authClient.js'

const router = express.Router()

// ROTAS
router.post('/registerCliente', authClient.cadClient)
router.post('/loginCliente', authClient.logClient)
router.post('/inscAtvClient', authClient.inscAtvClient)
router.post('/desinscAtvClient', authClient.desinscAtvClient)
router.post('/inscEventClient', authClient.inscEventClient)
router.post('/desinscEventClient', authClient.desinscEventClient)


export default router