import { Express, NextFunction, Request, Response, Router } from 'express';
import Controller from '../decorators/controller';
import { Delete, Get, Patch, Post } from '../decorators/route';
import Validate from '../decorators/validate';
import validate from '../middleware/validationHandler';
import quizDto, { QuizDto } from '../models/dtos/quizDto';
import { IdModel } from '../models/zod/idModel';
import { CompleteCreateQuiz, CompleteCreateQuizModel } from '../models/zod/quizModel';
import { QuizService } from '../services/quizService';
import IdParam from '../types/interfaces/idParam';
import { PatchQuiz, PatchQuizModel } from '../zod';

@Controller('/api/quizzes')
export default class QuizController {
    private readonly quizService: QuizService;

    constructor(quizService: QuizService) {
        this.quizService = quizService;
    }

    public applyRoutes(app: Express): void {
        const routes = Router();

        routes
            .route('/')
            .get(this.getAllQuizzes)
            .post(validate({ body: CompleteCreateQuizModel }), this.createQuiz);

        routes
            .route('/:id')
            .get(validate({ param: IdModel }), this.getQuizById)
            .patch(validate({ param: IdModel, body: PatchQuizModel }), this.updateQuizById)
            .delete(validate({ param: IdModel }), this.deleteQuizById);

        app.use('/api/quizzes', routes);
    }

    @Get()
    public async getAllQuizzes(req: Request, res: Response<QuizDto[]>) {
        const allQuizzes = await this.quizService.getAllViewableQuizzes(req.requester.id);
        res.ok(allQuizzes.map(quizDto));
    }

    @Post()
    public async createQuiz(req: Request<unknown, unknown, CompleteCreateQuiz>, res: Response, next: NextFunction) {
        try {
            const newQuiz = await this.quizService.createQuiz(req.body, req.requester.id);
            res.created(quizDto(newQuiz));
        } catch (err) {
            next(err);
        }
    }

    @Get('/:id')
    @Validate({ param: IdModel })
    public async getQuizById(req: Request<IdParam>, res: Response, next: NextFunction) {
        try {
            const quiz = await this.quizService.getViewableQuizById(req.params.id, req.requester.id);
            res.ok(quizDto(quiz));
        } catch (err) {
            next(err);
        }
    }

    @Patch('/:id')
    public async updateQuizById(req: Request<IdParam, undefined, PatchQuiz>, res: Response, next: NextFunction) {
        try {
            const quiz = await this.quizService.getQuizById(req.params.id);

            if (quiz.ownerId !== req.requester.id) {
                return res.forbidden('Only the owner can update a quiz');
            }

            const updatedQuiz = await this.quizService.updateQuizById(req.params.id, req.requester.id, req.body);

            res.ok(quizDto(updatedQuiz));
        } catch (err) {
            next(err);
        }
    }

    @Delete('/:id')
    public async deleteQuizById(req: Request<IdParam>, res: Response, next: NextFunction) {
        try {
            const quiz = await this.quizService.getQuizById(req.params.id);

            if (quiz.ownerId !== req.requester.id) {
                return res.forbidden('Only the owner can delete a quiz');
            }

            await this.quizService.deleteQuizById(req.params.id);

            res.noContent();
        } catch (err) {
            next(err);
        }
    }
}
