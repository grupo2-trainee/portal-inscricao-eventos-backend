import { PrismaClient } from '../generated/prisma/index.js'
import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET || 'includeJr'
const prisma = new PrismaClient()

const cadEvent = async(req,res)=>{
    const { nome, descricao, dataInicio, dataFim, categoria, cidade, refreshToken} = req.body

    if(nome.length < 4){
        res.status(400).json({erro: 'Nome do evento deve ter no mínimo 4 caracteres.'})
    }

    if(dataInicio > dataFim){
        res.status(400).json({erro: 'Data de início deve ser anterior ou na mesma data da data de fim.'})
    }

    if(!cidade || !categoria || !dataInicio || !dataFim || !descricao){
        res.status(400).json({erro: 'Todos os campos são obrigatórios '})
    }

    if(!refreshToken){
        res.status(403).json({erro: 'Usuário não autenticado.'})
    }

    let idAdmin
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        idAdmin = decodedToken.id

    } catch (err) {
        res.status(403).json({ erro: 'Token inválido ou expirado.' })
    }

    const quantidadeInscritos = 0

    try{
        const novoEvento = await prisma.evento.create({
            data: {
                nome,
                descricao,
                dataInicio,
                dataFim,
                quantidadeInscritos,
                categoria,
                cidade,
                administrador: {
                    connect:{ id: idAdmin }
                }
            }
        })

        res.status(200).json({sucesso: "Evento criado com sucesso.", evento: novoEvento})

    }catch(erro){
        res.status(500).json({erro: 'Erro ao criar evento.', detalhes: erro})
    }
}

const remEvent = async(req, res)=>{
    const {nome} = req.body

    if(!nome){
        res.status(400).json({erro: 'É necessario preencher o campo'})
    }
    try {
        const evento = await prisma.evento.findUnique({
            where: { nome }
        })

        if (!evento) {
            return res.status(404).json({ erro: 'Evento não encontrado.' })
        }

        await prisma.evento.delete({
            where: { nome }
        })

        res.status(200).json({ sucesso: 'Evento removido com sucesso.' })
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao remover evento.', detalhes: erro })
    }
    
}

const ediEvent = async (req, res) => {
  const { nome, descricao, dataInicio, dataFim, categoria, cidade } = req.body

  if (!nome) {
    res.status(400).json({ erro: 'É necessário preencher o campo nome.' })
  }

  try {
    const evento = await prisma.evento.findUnique({ where: { nome } })
    if (!evento) {
      res.status(404).json({ erro: 'Evento não encontrado.' })
    }

    const eventoAtualizado = await prisma.evento.update({
      where: { nome },
      data: {
        descricao,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        categoria,
        cidade
      }
    })

    res.status(200).json({ sucesso: 'Evento editado com sucesso.', evento: eventoAtualizado })
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao editar evento.', detalhes: erro.message })
  }
}

export default {
    ediEvent,
    remEvent,
    cadEvent
}