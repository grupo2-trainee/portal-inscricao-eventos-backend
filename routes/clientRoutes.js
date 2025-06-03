import express from "express"
import authClient from '../controllers/authClient.js'
import authTokens from "../middlewares/authTokens.js"


const router = express.Router()

// ROTAS EVENTOS
router.post('/inscEventClient', authTokens.authTokenClient, authClient.inscEventClient)
router.get('/verEventClient', authTokens.authTokenClient, authClient.viewInscEventClient)
router.delete('/desinscEventClient', authTokens.authTokenClient, authClient.desinscEventClient)

// ROTAS ATIVIDADES
router.post('/inscAtvClient', authTokens.authTokenClient, authClient.inscAtvClient)
router.get('/verAtvClient', authTokens.authTokenClient, authClient.viewinscAtvClient)
router.delete('/desinscAtvClient', authTokens.authTokenClient, authClient.desinscAtvClient)

// ROTAS PERFIL
router.get('/verPerfilClient', authTokens.authTokenClient, authClient.viewProfileClient)
router.patch('/editPerfilClient', authTokens.authTokenClient, authClient.editProfileClient)





export default router