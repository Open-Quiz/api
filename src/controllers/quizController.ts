import { Request, Response } from 'express';
import Controller from '../decorators/controller';
import { Delete, Get, Patch, Post } from '../decorators/route';
import Validate from '../decorators/validate';
import quizDto from '../models/dtos/quizDto';
import { AppendQuestions, AppendQuestionsModel } from '../models/zod/questionModel';
import { QuizIdModel, QuizId } from '../models/zod/idModel';
import { QuizService } from '../services/quizService';
import { CreateQuiz, CreateQuizModel, UpdateQuiz, UpdateQuizModel } from '../models/zod/quizModel';
import { AccessService } from '../services/accessService';
import LoggedIn from '../decorators/authenticationHandler';

@LoggedIn
@Controller('/quizzes')
export default class QuizController {
    @Get()
    public async getAllQuizzes(req: Request, res: Response) {
        const allQuizzes = await QuizService.getAllViewableQuizzes(req.requester.id);
        res.ok(allQuizzes.map(quizDto));
    }

    @Post()
    @Validate({ body: CreateQuizModel })
    public async createQuiz(req: Request<unknown, unknown, CreateQuiz>, res: Response) {
        const newQuiz = await QuizService.createQuiz(req.body, req.requester.id);
        res.created(quizDto(newQuiz));
    }

    @Get('/:quizId')
    @Validate({ param: QuizIdModel })
    public async getQuizById(req: Request<QuizId>, res: Response) {
        const quiz = await QuizService.getViewableQuizById(req.params.quizId, req.requester.id);
        res.ok(quizDto(quiz));
    }

    @Patch('/:quizId')
    @Validate({ param: QuizIdModel, body: UpdateQuizModel })
    public async updateQuizById(req: Request<QuizId, undefined, UpdateQuiz>, res: Response) {
        const quiz = await QuizService.getQuizById(req.params.quizId);

        if (!AccessService.canUserModify(quiz, req.requester.id)) {
            return res.forbidden('Only the owner can update a quiz');
        }

        const updatedQuiz = await QuizService.updateQuizById(req.params.quizId, req.requester.id, req.body);

        res.ok(quizDto(updatedQuiz));
    }

    @Delete('/:quizId')
    @Validate({ param: QuizIdModel })
    public async deleteQuizById(req: Request<QuizId>, res: Response) {
        const quiz = await QuizService.getQuizById(req.params.quizId);

        if (!AccessService.canUserModify(quiz, req.requester.id)) {
            return res.forbidden('Only the owner can delete a quiz');
        }

        await QuizService.deleteQuizById(req.params.quizId);

        res.noContent();
    }

    @Patch('/:quizId/questions')
    @Validate({ param: QuizIdModel, body: AppendQuestionsModel })
    public async appendQuizQuestionsById(req: Request<QuizId, undefined, AppendQuestions>, res: Response) {
        const quiz = await QuizService.getQuizById(req.params.quizId);

        if (!AccessService.canUserModify(quiz, req.requester.id)) {
            return res.forbidden('Only the owner can update a quiz');
        }

        const updatedQuiz = await QuizService.appendQuizQuestionsById(req.params.quizId, req.body.questions);

        res.ok(quizDto(updatedQuiz));
    }
}
