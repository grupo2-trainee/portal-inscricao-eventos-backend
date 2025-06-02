import { PrismaClient } from '../generated/prisma/index.js'
const prisma = new PrismaClient()

//LISTAR EVENTOS
const listEvent = async (req, res) => {
    //ACADEMICO
    const academico = await prisma.evento.findMany({
        where: {
            categoria: 'academico'
        },
        orderBy: {dataInicio: 'asc'}
    })

    //CIENTIFICO
    const cientifico = await prisma.evento.findMany({
        where: {
            categoria: 'cientifico'
        },
        orderBy: {dataInicio: 'asc'}
    })

    //CORPORATIVO
    const corporativo = await prisma.evento.findMany({
        where: {
            categoria: 'corporativo'
        },
        orderBy: {dataInicio: 'asc'}
    })

    //CURSO
    const curso = await prisma.evento.findMany({
        where: {
            categoria: 'curso'
        },
        orderBy: {dataInicio: 'asc'}
    })

    //ENTRETENIMENTO
    const entretenimento = await prisma.evento.findMany({
        where: {
            categoria: 'entretenimento'
        },
        orderBy: {dataInicio: 'asc'}
    })

    //RELIGIOSO
    const religioso = await prisma.evento.findMany({
        where: {
            categoria: 'religioso'
        },
        orderBy: {dataInicio: 'asc'}
    })

    //ESPORTIVO
    const esportivo = await prisma.evento.findMany({
        where: {
            categoria: 'esportivo'
        },
        orderBy: {dataInicio: 'asc'}
    })

    //EXIBICAO
    const exibicao = await prisma.evento.findMany({
        where: {
            categoria: 'exibicao'
        },
        orderBy: {dataInicio: 'asc'}
    })

    //NETWORKING
    const networking = await prisma.evento.findMany({
        where: {
            categoria: 'networking'
        },
        orderBy: {dataInicio: 'asc'}
    })

    //OUTRO
    const outro = await prisma.evento.findMany({
        where: {
            categoria: 'outro'
        },
        orderBy: {dataInicio: 'asc'}
    })

    return res.status(200).json({"Acadêmico": academico, "Científico": cientifico, "Corporativo": corporativo, "Curso": curso, "Entretenimento": entretenimento, "Religioso": religioso, "Esportivo": esportivo, "Exibição": exibicao, "Networking": networking, "Outro": outro})
}

// EXPORTAÇÕES
export default {
    listEvent
}