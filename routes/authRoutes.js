import express from "express"
import authClient from '../controllers/authClient.js'

const router = express.Router()

router.post('/registerCliente', authClient.cadClient)

export default router