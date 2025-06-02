import express from "express"
import test from "../controllers/teste.js"
import authTokens from "../middlewares/authTokens.js"
import authEvent from "../controllers/authEvent.js"
import authActiv from "../controllers/authActiv.js"

const router = express.Router()

// ROTAS
router.get('/', test.home) // APENAS PARA TESTES
router.post('/mid', authTokens.authTokenAdmin)
router.post('/cadEvento', authEvent.cadEvent)
router.patch('/ediEvento', authEvent.ediEvent)
router.delete('/remEvento', authEvent.remEvent)
router.get('/listEvento', authEvent.listEvent)
router.post('/cadAtividade', authActiv.cadActiv)
router.delete('/remAtividade', authActiv.remActiv)
router.get('/listAtividade', authActiv.listActiv)
router.patch('/ediAtividade', authActiv.ediActiv)

export default router