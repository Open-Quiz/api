import { afterAll, afterEach } from 'vitest';
import prisma from '../client/instance';

afterAll(async () => {
    const deleteQuestions = prisma.quizQuestion.deleteMany();
    const deleteQuizzes = prisma.quiz.deleteMany();
    const deleteUsers = prisma.user.deleteMany();

    await prisma.$transaction([deleteUsers, deleteQuizzes, deleteQuestions]);

    const resetQuestions = prisma.$queryRaw`ALTER SEQUENCE "QuizQuestion_id_seq" RESTART WITH 1;`;
    const resetQuiz = prisma.$queryRaw`ALTER SEQUENCE "Quiz_id_seq" RESTART WITH 1;`;
    const resetUsers = prisma.$queryRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1;`;

    await prisma.$transaction([resetUsers, resetQuiz, resetQuestions]);

    await prisma.$disconnect();
});
