import { Request, Response } from 'express';
import prisma from '../client/instance';
import Controller from '../decorators/controller';
import { Get } from '../decorators/route';
import Validate from '../decorators/validate';
import { Attempt } from '../models/zod/attemptModel';
import { IdArray, IdModel } from '../models/zod/idModel';
import { UpdateQuestion } from '../models/zod/quizQuestionModel';
import { QuestionService } from '../services/questionService';
import IdParam from '../types/interfaces/idParam';

@Controller('/api/quizzes/questions')
export default class QuizQuestionController {
    private readonly questionService: QuestionService;

    constructor(questionService: QuestionService) {
        this.questionService = questionService;
    }

    @Get('/:id')
    @Validate({ param: IdModel })
    public async getQuizQuestion(req: Request<IdParam>, res: Response) {
        const question = await this.questionService.getViewableQuestionById(req.params.id, req.requester.id);
        res.ok(question);
    }

    public async updateQuizQuestion(req: Request<IdParam, unknown, UpdateQuestion>, res: Response) {
        try {
            const updatedQuestion = await prisma.quizQuestion.update({
                where: { id: req.params.id },
                data: req.body,
            });

            res.ok(updatedQuestion);
        } catch (err) {
            return res.notFound(`There is no quiz question with the id ${req.params.id}`);
        }
    }

    public async deleteQuizQuestion(req: Request<IdParam>, res: Response) {
        try {
            await prisma.quizQuestion.delete({
                where: { id: req.params.id },
            });
        } catch (err) {
            return res.badRequest([{ path: 'id', message: `There is no quiz question with the id ${req.params.id}` }]);
        }

        res.noContent();
    }

    public async deleteQuizQuestions(req: Request<unknown, unknown, IdArray>, res: Response) {
        const deletedCount = await prisma.quizQuestion.deleteMany({
            where: {
                id: {
                    in: req.body.ids,
                },
            },
        });

        res.ok({ deletedCount });
    }

    public async updateQuizQuestionStats(req: Request<IdParam, unknown, Attempt>, res: Response) {
        await prisma.quizQuestion.update({
            where: { id: req.params.id },
            data: req.body.isCorrect
                ? {
                      totalCorrectAttempts: { increment: 1 },
                  }
                : {
                      totalIncorrectAttempts: { increment: 1 },
                  },
        });

        res.noContent();
    }
}
