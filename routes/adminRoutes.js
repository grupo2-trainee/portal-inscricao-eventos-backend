import express from "express"
import authTokens from "../middlewares/authTokens.js"
import authEvent from "../controllers/authEvent.js"

const router = express.Router()

// ROTAS
router.post('/cadEvento', authTokens.authTokenAdmin, authEvent.cadEvent)
router.patch('/ediEvento', authTokens.authTokenAdmin, authEvent.ediEvent)
router.delete('/remEvento', authTokens.authTokenAdmin, authEvent.remEvent)
router.get('/listEvento', authTokens.authTokenAdmin, authEvent.listEvent)

export default router