import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.create({
    data: {
      nome: "João da Silva",
      email: "joao@teste.com",
      papel: "PROFESSOR",
    },
  });

  const subject = await prisma.subject.create({
    data: {
      nome: "Matemática",
      ativa: true,
      professorId: user.id,
    },
  });

  const question = await prisma.question.create({
    data: {
      enunciado: "Quanto é 2 + 2?",
      dificuldade: 1,
      respostaCorreta: "4",
      subjectId: subject.id,
      authorId: user.id,
      ativa: true,
    },
  });

  console.log("\n=== DADOS CRIADOS ===");
  console.log("Usuário:", user);
  console.log("Matéria:", subject);
  console.log("Questão:", question);
}

main()
  .catch((error) => {
    console.error("Erro:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
