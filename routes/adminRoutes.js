import express from "express"
import authTokens from "../middlewares/authTokens.js"
import authEvent from "../controllers/authEvent.js"
import authAdmin from "../controllers/authAdmin.js"
import upload from "../upload.js"

const router = express.Router()

// EVENTO/ATIVIDADE
router.post('/cadEvento', upload.single('imagemFile'), authTokens.authTokenAdmin, authEvent.cadEvent)
router.patch('/ediEvento', upload.single('imagemFile'), authTokens.authTokenAdmin, authEvent.ediEvent)
router.delete('/remEvento', authTokens.authTokenAdmin, authEvent.remEvent)
router.get('/listEvento', authTokens.authTokenAdmin, authEvent.listEvent)

// PERFIL
router.get('/verPerfil', authTokens.authTokenAdmin, authAdmin.viewProfileAdmin)
router.patch('/editPerfil', authTokens.authTokenAdmin, authAdmin.editProfileAdmin)
router.delete('/deleteAdmin',authTokens.authTokenAdmin, authAdmin.deleteAdmin)

// INSCRITOS
router.get('/verInscritosEvento', authTokens.authTokenAdmin, authEvent.viewInscEvent)
router.get('/verInscritosAtividade', authTokens.authTokenAdmin, authEvent.viewInscAtv)

export default router