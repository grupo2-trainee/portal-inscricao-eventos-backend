import express from "express"
import test from "../controllers/teste.js"
import authTokens from "../middlewares/authTokens.js"
import authEvent from "../controllers/authEvent.js"

const router = express.Router()

// ROTAS
router.get('/', authTokens.authTokenAdmin, test.home) // APENAS PARA TESTES
router.post('/cadEvento', authEvent.cadEvent)

export default router