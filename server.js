import express from 'express'
import authRoutes from './routes/authRoutes.js'
import clientRoutes from './routes/clientRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import homeRoutes from './routes/homeRoutes.js'
import path from 'path'

const app = express()

app.use(express.json())

// AUTENTICACAO
app.use('/auth', authRoutes)

// CLIENTE
app.use('/client', clientRoutes)

//ADMINISTRADOR
app.use('/admin', adminRoutes)

// HOME
app.use('/', homeRoutes)

// UPLOAD IMAGEM
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))
app.use(express.urlencoded({ extended: true }))

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000')
})
