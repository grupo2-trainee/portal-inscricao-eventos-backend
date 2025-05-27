import express from "express"
import test from "../controllers/teste.js"
import authTokens from "../middlewares/authTokens.js"

const router = express.Router()

// ROTAS
router.get('/', authTokens.authTokenAdmin, test.home) // APENAS PARA TESTES

export default router