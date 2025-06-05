import express from "express"
import authTokens from "../middlewares/authTokens.js"
import authEvent from "../controllers/authEvent.js"
import authAdmin from "../controllers/authAdmin.js"

const router = express.Router()

// ROTAS
router.post('/cadEvento', authTokens.authTokenAdmin, authEvent.cadEvent)
router.patch('/ediEvento', authTokens.authTokenAdmin, authEvent.ediEvent)
router.delete('/remEvento', authTokens.authTokenAdmin, authEvent.remEvent)
router.get('/listEvento', authTokens.authTokenAdmin, authEvent.listEvent)
router.get('/verPerfil', authTokens.authTokenAdmin, authAdmin.viewProfileAdmin)
router.patch('/editPerfil', authTokens.authTokenAdmin, authAdmin.editProfileAdmin)
router.get('/verInscritos', authTokens.authTokenAdmin, authEvent.viewInscAtv)

export default router