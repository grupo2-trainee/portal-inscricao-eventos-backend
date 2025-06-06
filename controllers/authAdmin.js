import { PrismaClient } from '../generated/prisma/index.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { fileURLToPath } from 'url'
import fs from 'fs'
import path from 'path'
const JWT_SECRET = process.env.JWT_SECRET || 'includeJr'
const prisma = new PrismaClient()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// CADASTRAR USUÁRIO ADMINISTRADOR
const cadAdmin = async(req, res) => {
    const { nome, email, senha } = req.body
    if(senha.length < 8){
        res.status(400).json({erro: 'Erro, senha deve ter no mínimo 8 caracteres.'})
    }
    if(nome.length < 4){
        res.status(400).json({erro: 'Erro, nome deve ter no mínimo 4 caracteres.'})
    }
    const senhaCript = await bcrypt.hash(senha, 10)

    const cadastradoCliente = await prisma.cliente.findUnique({
        where: {email},
    })

    const cadastradoAdmin = await prisma.administrador.findUnique({
        where: {email},
    })

    if(cadastradoCliente || cadastradoAdmin){
        return res.status(400).json({erro: 'Erro, esse email já foi cadastrado, por favor use outro.'})
    }

    try{
        const novoUsuario = await prisma.administrador.create({
            data:{nome, email, senha: senhaCript}
        })
        return res.status(201).json({sucesso: 'Usuário criado com sucesso.'})
    }catch(error){
        return res.status(500).json({erro: 'Erro ao criar novo usuário administrador.', detalhes: error})
    }
}

// LOGIN USUÁRIO ADMINISTRADOR
const logAdmin = async(req, res) =>{
    const { email, senha } = req.body
    if(!email || !senha){
        res.status(400).json({erro: 'Email e senha são obrigatórios.'})
    }
    if(senha.length < 8){
        res.status(400).json({erro: 'Erro, senha deve ter no mínimo 8 caracteres.'})
    }

    try{
        const cliente = await prisma.cliente.findUnique({where: {email}})
        if(cliente){
            const senhaValida = await bcrypt.compare(senha, cliente.senha)
            if(!senhaValida){
                res.status(400).json({erro: 'Senha inválida.'})
            }

            const refreshToken = jwt.sign({ id: cliente.id, type: "CLIENT" }, JWT_SECRET, {expiresIn: '8h'})
            
            res.status(200).json({sucesso: 'Login cliente realizado com sucesso.', refreshToken: refreshToken})
        }

        const administrador = await prisma.administrador.findUnique({where: {email}})
        
        if(!cliente && !administrador){
            res.status(404).json({erro: 'Usuário não encontrado.', administrador})
        }

        const senhaValida = await bcrypt.compare(senha, administrador.senha)
        if(!senhaValida){
            res.status(400).json({erro: 'Senha inválida.'})
        }

        const refreshToken = jwt.sign({ id: administrador.id, type: "ADMIN" }, JWT_SECRET, {expiresIn: '8h'})
        
        res.status(200).json({sucesso: 'Login admin realizado com sucesso.', refreshToken: refreshToken})
    }
    catch(error){
        res.status(500).json({erro: 'Erro ao realizar login.', detalhes: error})
    }
}

// VER PERFIL ADMINISTRADOR
const viewProfileAdmin = async(req, res) => {
    const { refreshToken } = req.body
    if(!refreshToken){
        return res.status(400).json({erro: 'Dados inválidos.'})
    }

    try{
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        const idAdmin = decodedToken.id

        const administrador = await prisma.administrador.findUnique({
            where: { id: idAdmin },
        })

        const eventos = await prisma.evento.findMany({
            where: {idAdmin},
        })

        const quantidadeEventos = eventos.length

        if(!administrador){
            return res.status(403).json({erro: 'Administrador não encontrado.'})
        }

        administrador.senha = ""
        return res.status(200).json({sucesso: 'Perfil', administrador, "Eventos": eventos.length})
    } catch (error) {
        return res.status(500).json({erro: 'Erro ao procurar perfil do administrador.', detalhes: error.message})
    }
}

// EDITAR PERFIL ADMINISTRADOR
const editProfileAdmin = async(req, res) => {
    const { nome, email, senha, refreshToken } = req.body
    if(!refreshToken){
        return res.status(400).json({erro: 'Dados inválidos.'})
    }
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        const idAdmin = decodedToken.id

        const administrador = await prisma.administrador.findUnique({
            where: { id: idAdmin },
        })

        if(!administrador){
            return res.status(403).json({erro: 'Administrador não encontrado.'})
        }

        const updatedData = {}
        if(nome) updatedData.nome = nome
        if(email) updatedData.email = email
        if(senha) updatedData.senha = await bcrypt.hash(senha, 10)

        const updatedAdmin = await prisma.administrador.update({
            where: { id: idAdmin },
            data: updatedData,
        })

        return res.status(200).json({sucesso: 'Perfil do administrador atualizado com sucesso.'})
    } catch (error) {
        return res.status(500).json({erro: 'Erro ao atualizar perfil do administrador.', detalhes: error.message})
    }
}

// APAGAR PERFIL ADMINISTRADOR
const deleteAdmin = async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(403).json({ erro: 'Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const idAdmin = decoded.id

    const eventos = await prisma.evento.findMany({
      where: { idAdmin },
      include: {
        atividades: {
          include: {
            inscricoes: true
          }
        },
        inscricoes: true
      }
    })

    for (const evento of eventos) {
      for (const atividade of evento.atividades) {
        await prisma.inscricaoAtividade.deleteMany({
          where: { idAtividade: atividade.id }
        })
      }
    }

    for (const evento of eventos) {
      await prisma.atividade.deleteMany({
        where: { idEvento: evento.id }
      })
    }

    for (const evento of eventos) {
      if (evento.imagemURL) {
        const imagemPath = path.join(__dirname, '..', evento.imagemURL);
        if (fs.existsSync(imagemPath)) {
          fs.unlinkSync(imagemPath);
        }
      }
    }

    for (const evento of eventos) {
      await prisma.inscricaoEvento.deleteMany({
        where: { idEvento: evento.id }
      })
    }

    await prisma.evento.deleteMany({
      where: { idAdmin }
    })

    await prisma.administrador.delete({
      where: { id: idAdmin }
    })

    return res.status(200).json({ sucesso: 'Perfil e todos os dados associados foram removidos com sucesso.' });

  } catch (error) {
    return res.status(500).json({erro: 'Erro ao remover.', detalhes: error.message})
  }
}

// EXPORTAÇÕES
export default{
    deleteAdmin,
    editProfileAdmin,
    viewProfileAdmin,
    cadAdmin,
    logAdmin
}