import { afterAll, afterEach } from 'vitest';
import prisma from '../client/instance';

afterAll(async () => {
    const deleteQuestions = prisma.quizQuestion.deleteMany();
    const deleteQuizzes = prisma.quiz.deleteMany();
    const deleteUsers = prisma.user.deleteMany();

    await prisma.$transaction([deleteUsers, deleteQuizzes, deleteQuestions]);
    await prisma.$disconnect();
});
