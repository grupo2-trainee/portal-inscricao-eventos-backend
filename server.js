import express from 'express'
import authRoutes from './routes/authRoutes.js'
import clientRoutes from './routes/clientRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

const app = express()

app.use(express.json())
app.use('/auth', authRoutes)
app.use('/client', clientRoutes)
app.use('/admin', adminRoutes)

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000')
})
