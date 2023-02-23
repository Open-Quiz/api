import { Request, Response } from 'express';
import Controller from '../decorators/controller';
import { Delete, Get, Patch, Post } from '../decorators/route';
import Validate from '../decorators/validate';
import quizDto from '../models/dtos/quizDto';
import { AppendQuestions, AppendQuestionsModel } from '../models/zod/questionModel';
import { IdModel, IdParam } from '../models/zod/idModel';
import { QuizService } from '../services/quizService';
import { CreateQuiz, CreateQuizModel, UpdateQuiz, UpdateQuizModel } from '../models/zod/quizModel';
import { AccessService } from '../services/accessService';

@Controller('/api/quizzes')
export default class QuizController {
    constructor(private readonly quizService: QuizService, private readonly accessService: AccessService) {}

    @Get()
    public async getAllQuizzes(req: Request, res: Response) {
        const allQuizzes = await this.quizService.getAllViewableQuizzes(req.requester.id);
        res.ok(allQuizzes.map(quizDto));
    }

    @Post()
    @Validate({ body: CreateQuizModel })
    public async createQuiz(req: Request<unknown, unknown, CreateQuiz>, res: Response) {
        const newQuiz = await this.quizService.createQuiz(req.body, req.requester.id);
        res.created(quizDto(newQuiz));
    }

    @Get('/:id')
    @Validate({ param: IdModel })
    public async getQuizById(req: Request<IdParam>, res: Response) {
        const quiz = await this.quizService.getViewableQuizById(req.params.id, req.requester.id);
        res.ok(quizDto(quiz));
    }

    @Patch('/:id')
    @Validate({ param: IdModel, body: UpdateQuizModel })
    public async updateQuizById(req: Request<IdParam, undefined, UpdateQuiz>, res: Response) {
        const quiz = await this.quizService.getQuizById(req.params.id);

        if (!this.accessService.canUserModify(quiz, req.requester.id)) {
            return res.forbidden('Only the owner can update a quiz');
        }

        const updatedQuiz = await this.quizService.updateQuizById(req.params.id, req.requester.id, req.body);

        res.ok(quizDto(updatedQuiz));
    }

    @Delete('/:id')
    @Validate({ param: IdModel })
    public async deleteQuizById(req: Request<IdParam>, res: Response) {
        const quiz = await this.quizService.getQuizById(req.params.id);

        if (!this.accessService.canUserModify(quiz, req.requester.id)) {
            return res.forbidden('Only the owner can delete a quiz');
        }

        await this.quizService.deleteQuizById(req.params.id);

        res.noContent();
    }

    @Patch('/:id/questions')
    @Validate({ param: IdModel, body: AppendQuestionsModel })
    public async appendQuizQuestionsById(req: Request<IdParam, undefined, AppendQuestions>, res: Response) {
        const quiz = await this.quizService.getQuizById(req.params.id);

        if (!this.accessService.canUserModify(quiz, req.requester.id)) {
            return res.forbidden('Only the owner can update a quiz');
        }

        const updatedQuiz = await this.quizService.appendQuizQuestionsById(req.params.id, req.body.questions);

        res.ok(quizDto(updatedQuiz));
    }
}
