import prisma from "../config/database.js";

const publicSubjectSelect = {
  id: true,
  nome: true,
};

const publicAuthorSelect = {
  id: true,
  nome: true,
  email: true,
};

function toPositiveInt(value) {
  const number = Number(value);

  return Number.isInteger(number) && number > 0 ? number : null;
}

// CREATE - Criar nova questão
export const create = async (req, res) => {
  try {
    const {
      enunciado,
      dificuldade,
      respostaCorreta,
      subjectId,
      authorId,
      ativa,
    } = req.body;

    // Validação dos campos obrigatórios
    if (typeof enunciado !== "string" || !enunciado.trim()) {
      return res.status(400).json({
        success: false,
        message: "Enunciado é obrigatório",
      });
    }

    const dificuldadeValidada = toPositiveInt(dificuldade);

    if (
      !dificuldadeValidada ||
      ![1, 2, 3].includes(dificuldadeValidada)
    ) {
      return res.status(400).json({
        success: false,
        message: "dificuldade deve ser 1, 2 ou 3",
      });
    }

    const subjectIdValidado = toPositiveInt(subjectId);

    if (!subjectIdValidado) {
      return res.status(400).json({
        success: false,
        message: "subjectId deve ser um número inteiro positivo",
      });
    }

    const authorIdValidado = toPositiveInt(authorId);

    if (!authorIdValidado) {
      return res.status(400).json({
        success: false,
        message: "authorId deve ser um número inteiro positivo",
      });
    }

    // Verifica se a matéria existe
    const subject = await prisma.subject.findUnique({
      where: {
        id: subjectIdValidado,
      },
      select: {
        id: true,
      },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: `Matéria com ID ${subjectIdValidado} não encontrada`,
      });
    }

    // Verifica se o autor existe
    const author = await prisma.user.findUnique({
      where: {
        id: authorIdValidado,
      },
      select: {
        id: true,
      },
    });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: `Autor com ID ${authorIdValidado} não encontrado`,
      });
    }

    const novaQuestion = await prisma.question.create({
      data: {
        enunciado: enunciado.trim(),
        dificuldade: dificuldadeValidada,
        respostaCorreta:
          typeof respostaCorreta === "string"
            ? respostaCorreta.trim() || null
            : null,
        subjectId: subjectIdValidado,
        authorId: authorIdValidado,
        ...(typeof ativa === "boolean" ? { ativa } : {}),
      },
      select: {
        id: true,
        enunciado: true,
        dificuldade: true,
        respostaCorreta: true,
        ativa: true,
        createdAt: true,
        updatedAt: true,

        subject: {
          select: publicSubjectSelect,
        },

        author: {
          select: publicAuthorSelect,
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Questão criada com sucesso",
      data: novaQuestion,
    });
  } catch (error) {
    console.error("Erro ao criar questão:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao criar questão",
    });
  }
};

// READ - Listar todas as questões
export const getAll = async (_req, res) => {
  try {
    const questions = await prisma.question.findMany({
      select: {
        id: true,
        enunciado: true,
        dificuldade: true,
        respostaCorreta: true,
        ativa: true,
        createdAt: true,
        updatedAt: true,

        subject: {
          select: publicSubjectSelect,
        },

        author: {
          select: publicAuthorSelect,
        },
      },

      orderBy: {
        id: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      data: questions,
      total: questions.length,
    });
  } catch (error) {
    console.error("Erro ao listar questões:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao listar questões",
    });
  }
};

// READ - Buscar questão por ID
export const getById = async (req, res) => {
  try {
    const questionId = toPositiveInt(req.params.id);

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número inteiro positivo",
      });
    }

    const question = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
      select: {
        id: true,
        enunciado: true,
        dificuldade: true,
        respostaCorreta: true,
        ativa: true,
        createdAt: true,
        updatedAt: true,

        subject: {
          select: publicSubjectSelect,
        },

        author: {
          select: publicAuthorSelect,
        },
      },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: `Questão com ID ${questionId} não encontrada`,
      });
    }

    return res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Erro ao buscar questão:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao buscar questão",
    });
  }
};