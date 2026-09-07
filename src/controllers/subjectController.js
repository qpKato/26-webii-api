import prisma from "../config/database.js";

const publicProfessorSelect = {
  id: true,
  nome: true,
  email: true,
};

function toPositiveInt(value) {
  const number = Number(value);

  return Number.isInteger(number) && number > 0 ? number : null;
}

// CREATE - Criar nova matéria
export const create = async (req, res) => {
  try {
    const { nome, professorId, ativa } = req.body;

    // Validação dos campos obrigatórios
    if (typeof nome !== "string" || !nome.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nome da matéria é obrigatório",
      });
    }

    const professorIdValidado = toPositiveInt(professorId);

    if (!professorIdValidado) {
      return res.status(400).json({
        success: false,
        message: "professorId deve ser um número inteiro positivo",
      });
    }

    // Verifica se o professor existe
    const professor = await prisma.user.findUnique({
      where: { id: professorIdValidado },
      select: {
        id: true,
      },
    });

    if (!professor) {
      return res.status(404).json({
        success: false,
        message: `Professor com ID ${professorIdValidado} não encontrado`,
      });
    }

    const novaMateria = await prisma.subject.create({
      data: {
        nome: nome.trim(),
        professorId: professorIdValidado,
        ...(typeof ativa === "boolean" ? { ativa } : {}),
      },
      select: {
        id: true,
        nome: true,
        ativa: true,
        createdAt: true,
        updatedAt: true,
        professor: {
          select: publicProfessorSelect,
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Matéria criada com sucesso",
      data: novaMateria,
    });
  } catch (error) {
    console.error("Erro ao criar matéria:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao criar matéria",
    });
  }
};

// READ - Listar todas as matérias
export const getAll = async (_req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        nome: true,
        ativa: true,
        createdAt: true,
        updatedAt: true,
        professor: {
          select: publicProfessorSelect,
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      data: subjects,
      total: subjects.length,
    });
  } catch (error) {
    console.error("Erro ao listar matérias:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao listar matérias",
    });
  }
};

// READ - Buscar matéria por ID
export const getById = async (req, res) => {
  try {
    const subjectId = toPositiveInt(req.params.id);

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número inteiro positivo",
      });
    }

    const subject = await prisma.subject.findUnique({
      where: {
        id: subjectId,
      },
      select: {
        id: true,
        nome: true,
        ativa: true,
        createdAt: true,
        updatedAt: true,
        professor: {
          select: publicProfessorSelect,
        },
      },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: `Matéria com ID ${subjectId} não encontrada`,
      });
    }

    return res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    console.error("Erro ao buscar matéria:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao buscar matéria",
    });
  }
};