import { PrismaClient } from '../generated/prisma/index.js'
import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET || 'includeJr'
const prisma = new PrismaClient()

// CADASTRAR EVENTO E ATIVIDADES
const cadEvent = async (req, res) => {
    const { nome, descricao, dataInicio, dataFim, categoria, cidade, imagemURL, tipo, refreshToken, atividades} = req.body

    if (!nome || nome.length < 4) {
        return res.status(400).json({ erro: 'Nome do evento deve ter no mínimo 4 caracteres.' })
    }

    if (!descricao || !dataInicio || !dataFim || !categoria || !cidade || !imagemURL || !tipo) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' })
    }

    if (dataInicio > dataFim) {
        return res.status(400).json({ erro: 'Data de início deve ser anterior ou igual à data de fim.' })
    }

    if (!refreshToken) {
        return res.status(403).json({ erro: 'Usuário não autenticado.' })
    }

    let idAdmin
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        idAdmin = decodedToken.id

    } catch (err) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' })
    }

    try {
        const eventoCriado = await prisma.evento.create({
        data: {
            nome,
            descricao,
            dataInicio,
            dataFim,
            quantidadeInscritos: 0,
            categoria,
            cidade,
            tipo,
            imagemURL,
            administrador: {
            connect: { id: idAdmin },
            },
        },
        })

        const idEvento = eventoCriado.id

        if (atividades && Array.isArray(atividades)) {
            for (const atividade of atividades) {
                if (!atividade.nome || !atividade.descricao || !atividade.dataInicio || !atividade.dataFim || !atividade.maximoInscritos || !atividade.localizacao) {
                    continue
                }

                try {
                    await prisma.atividade.create({
                        data: {
                            nome: atividade.nome,
                            descricao: atividade.descricao,
                            dataInicio: atividade.dataInicio,
                            dataFim: atividade.dataFim,
                            maximoInscritos: atividade.maximoInscritos,
                            quantidadeInscritos: 0,
                            localizacao: atividade.localizacao,
                            evento: {
                                connect: { id: idEvento },
                            },
                        },
                    })
                }

                catch (erro) {
                    return res.status(400).json('Erro ao criar atividade:', atividade, erro)
                }
            }
        }
    
        return res.status(201).json({"sucesso": "Evento e atividades criados com sucesso."})
    
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao criar evento.', detalhes: erro.message })
    }
}

// REMOVER EVENTO
const remEvent = async(req, res)=>{
    const {id, refreshToken} = req.body

    if(!id, !refreshToken){
        return res.status(400).json({erro: 'Dados inválidos.'})
    }

    let idAdmin
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        idAdmin = decodedToken.id

    } catch (err) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' })
    }

    try {
        const evento = await prisma.evento.findUnique({
            where: { 
                id,
                idAdmin
             }
        })

        if (!evento) {
            return res.status(404).json({ erro: 'Evento não encontrado.' })
        }

        await prisma.evento.delete({
            where: { id, idAdmin}
        })

        return res.status(200).json({ sucesso: 'Evento removido com sucesso.' })
    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao remover evento.', detalhes: erro })
    }
    
}

// EDITAR EVENTO E ATIVIDADES
const ediEvent = async (req, res) => {
    const {id,nome,descricao,dataInicio,dataFim,categoria,cidade,tipo,imagemURL,atividades,atividadesRemovidas,refreshToken} = req.body

    if (!id) {
        return res.status(400).json({ erro: 'Dados inválidos.' })
    }

    if (nome && nome.length < 4) {
        return res.status(400).json({ erro: 'Nome do evento deve ter no mínimo 4 caracteres.' })
    }

    if (dataInicio && dataFim && new Date(dataInicio) > new Date(dataFim)) {
        return res.status(400).json({ erro: 'Data de início deve ser anterior ou igual à data de fim.' })
    }

    let idAdmin
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        idAdmin = decodedToken.id
    } catch (err) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' })
    }

    const dataEdit = {}
    if (nome != null) dataEdit.nome = nome
    if (descricao != null) dataEdit.descricao = descricao
    if (dataInicio != null) dataEdit.dataInicio = dataInicio
    if (dataFim != null) dataEdit.dataFim = dataFim
    if (categoria != null) dataEdit.categoria = categoria
    if (cidade != null) dataEdit.cidade = cidade
    if (tipo != null) dataEdit.tipo = tipo
    if (imagemURL != null) dataEdit.imagemURL = imagemURL

    try {
        const evento = await prisma.evento.findUnique({ where: { id } })

        if (!evento || evento.idAdmin !== idAdmin) {
            return res.status(404).json({ erro: 'Evento não encontrado ou acesso negado.' })
        }

        await prisma.evento.update({
            where: { id },
            data: dataEdit
        })

        if (atividadesRemovidas && Array.isArray(atividadesRemovidas)) {
            for (const idAtividade of atividadesRemovidas) {
                const atividade = await prisma.atividade.findUnique({ where: { id: idAtividade } })
                
                if (atividade && atividade.idEvento === evento.id) {
                    await prisma.atividade.delete({
                        where: { id: idAtividade } 
                    })
                }
            }
        }

        if (atividades && Array.isArray(atividades)) {
            for (const atividade of atividades) {
                const {id: idAtividade,nome,descricao,dataInicio,dataFim,maximoInscritos,localizacao} = atividade

                const atividadeData = {};
                if (nome != null) atividadeData.nome = nome
                if (descricao != null) atividadeData.descricao = descricao
                if (dataInicio != null) atividadeData.dataInicio = dataInicio
                if (dataFim != null) atividadeData.dataFim = dataFim
                if (maximoInscritos != null) atividadeData.maximoInscritos = maximoInscritos
                if (localizacao != null) atividadeData.localizacao = localizacao

                if (idAtividade) {
                    const existente = await prisma.atividade.findUnique({
                        where: { id: idAtividade }
                    })

                    if (!existente || existente.idEvento !== evento.id) {
                        continue
                    }
                    
                    await prisma.atividade.update({
                        where: { id: idAtividade },
                        data: atividadeData
                    })

                } 
                else {
                    atividadeData.idEvento = id
                    atividadeData.quantidadeInscritos = 0
                    await prisma.atividade.create({ data: atividadeData })
                }
            }
        }

        return res.status(200).json({sucesso: 'Evento e atividades processados com sucesso.'})

    } catch (erro) {
        return res.status(500).json({ erro: 'Erro ao editar evento.', detalhes: erro.message })
    }
}

//LISTAR EVENTO E ATIVIDADES
const listEvent = async (req, res) => {
    const { refreshToken } = req.body

    if(!refreshToken){
        return res.status(403).json({erro: 'Usuário não autenticado.'})
    }

    let idAdmin
    try {
        const decodedToken = jwt.verify(refreshToken, JWT_SECRET)
        idAdmin = decodedToken.id

    } catch (err) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' })
    }

    const eventos = await prisma.evento.findMany({
        where: {idAdmin},
        orderBy: {dataInicio: 'asc'},
        include: {atividades: true}
    })

    const quantidadeEventos = eventos.length

    const totalInscritos = eventos.reduce((soma, evento)=>{
        return soma + (evento.quantidadeInscritos || 0)
    }, 0)

    return res.status(200).json({"Lista de eventos": eventos, "Quantidade de eventos": quantidadeEventos, "Total de inscritos": totalInscritos})
}

const viewInscEvent = async (req, res) => {
  const { idEvento, refreshToken } = req.body;
  if (!idEvento || !refreshToken) {
    return res.status(400).json({ erro: 'Dados inválidos.' });
  }

  try {
    const decodedToken = jwt.verify(refreshToken, JWT_SECRET);
    const idAdmin = decodedToken.id;

    const evento = await prisma.evento.findUnique({
      where: { id: idEvento },
      include: {
        _count: {
          select: {
            inscricoes: true
          }
        }
      }
    });

    if (!evento || evento.idAdmin !== idAdmin) {
      return res.status(404).json({ erro: 'Evento não encontrado ou acesso negado.' });
    }

    return res.status(200).json({ totalInscritos: evento._count.inscricoes });
  } catch (error) {
    return res
      .status(500)
      .json({ erro: 'Erro ao buscar evento.', detalhes: error.message });
  }
};

// EXPORTAÇÕES
export default {
    viewInscEvent,
    ediEvent,
    remEvent,
    cadEvent,
    listEvent
}