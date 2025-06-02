import express from "express"
import authHome from "../controllers/authHome.js"

const router = express.Router()

// ROTAS
router.get('/', authHome.listEvent)

export default router