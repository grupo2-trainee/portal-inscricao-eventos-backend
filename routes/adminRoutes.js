import express from "express"
import test from "../controllers/teste.js"
import authTokens from "../middlewares/authTokens.js"
import authEvent from "../controllers/authEvent.js"

const router = express.Router()

// ROTAS
router.get('/', authTokens.authTokenAdmin, test.home) // APENAS PARA TESTES
router.post('/cadEvento', authEvent.cadEvent)
router.patch('/ediEvento', authEvent.ediEvent)
router.delete('/remEvento', authEvent.remEvent)
router.get('/listEvento', authEvent.listEvent)

export default router