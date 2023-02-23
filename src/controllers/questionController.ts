import { Request, Response } from 'express';
import Controller from '../decorators/controller';
import { Delete, Get, Patch } from '../decorators/route';
import Validate from '../decorators/validate';
import ForbiddenError from '../errors/forbiddenError';
import questionDto from '../models/dtos/questionDto';
import { IdModel, IdParam } from '../models/zod/idModel';
import {
    QuestionIds,
    QuestionIdsModel,
    UpdateQuestion,
    UpdateQuestionModel,
    UpdateQuestionStats,
    UpdateQuestionStatsModel,
} from '../models/zod/questionModel';
import { AccessService } from '../services/accessService';
import { QuestionService } from '../services/questionService';

@Controller('/api/questions')
export default class QuizQuestionController {
    constructor(private readonly questionService: QuestionService, private readonly accessService: AccessService) {}

    @Delete()
    @Validate({ body: QuestionIdsModel })
    public async deleteQuestions(req: Request<unknown, unknown, QuestionIds>, res: Response) {
        const questions = await this.questionService.getQuestionsWithQuizById(req.body.questionIds);

        const cantAccessQuestionIds = questions
            .filter((question) => !this.accessService.canUserAccess(question.quiz, req.requester.id))
            .map((question) => question.id);

        if (cantAccessQuestionIds.length !== 0) {
            return res.forbidden(`You must be the owner of the quizzes ${cantAccessQuestionIds} to delete them`);
        }

        const deletedCount = await this.questionService.deleteQuestions(req.body.questionIds);

        res.ok({ deletedCount });
    }

    @Get('/:id')
    @Validate({ param: IdModel })
    public async getQuestionById(req: Request<IdParam>, res: Response) {
        const question = await this.questionService.getQuestionWithQuizById(req.params.id);

        if (!this.accessService.canUserAccess(question.quiz, req.requester.id)) {
            throw new ForbiddenError(`You do not have access to the quiz question ${req.params.id}`);
        }

        res.ok(questionDto(question));
    }

    @Patch('/:id')
    @Validate({ param: IdModel, body: UpdateQuestionModel })
    public async updateQuestionById(req: Request<IdParam, unknown, UpdateQuestion>, res: Response) {
        const question = await this.questionService.getQuestionWithQuizById(req.params.id);

        if (!this.accessService.canUserModify(question.quiz, req.requester.id)) {
            return res.forbidden('Only the owner can update a quiz question');
        }

        const updatedQuestion = await this.questionService.updateQuestionById(question, req.params.id, req.body);

        res.ok(updatedQuestion);
    }

    @Delete('/:id')
    @Validate({ param: IdModel })
    public async deleteQuizQuestion(req: Request<IdParam>, res: Response) {
        const question = await this.questionService.getQuestionWithQuizById(req.params.id);

        if (!this.accessService.canUserModify(question.quiz, req.requester.id)) {
            return res.forbidden('Only the owner can delete a quiz question');
        }

        await this.questionService.deleteQuestion(question.id);
        res.noContent();
    }

    @Patch('/:id/stats')
    @Validate({ param: IdModel, body: UpdateQuestionStatsModel })
    public async updateQuestionStats(req: Request<IdParam, unknown, UpdateQuestionStats>, res: Response) {
        const question = await this.questionService.getQuestionWithQuizById(req.params.id);

        if (!this.accessService.canUserAccess(question.quiz, req.requester.id)) {
            return res.forbidden(`You do not have access to the quiz question ${req.params.id}`);
        }

        const updatedQuestion = await this.questionService.updateQuestionStats(req.params.id, req.body);

        res.ok(updatedQuestion);
    }
}
