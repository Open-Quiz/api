import { Request, Response } from 'express';
import Controller from '../decorators/controller';
import { Delete, Get, Patch } from '../decorators/route';
import Validate from '../decorators/validate';
import ForbiddenError from '../errors/forbiddenError';
import questionDto from '../models/dtos/questionDto';
import { QuestionId, QuestionIdModel } from '../models/zod/idModel';
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

@Controller('/questions')
export default class QuizQuestionController {
    @Delete()
    @Validate({ body: QuestionIdsModel })
    public async deleteQuestions(req: Request<unknown, unknown, QuestionIds>, res: Response) {
        const questions = await QuestionService.getQuestionsWithQuizById(req.body.questionIds);

        const cantAccessQuestionIds = questions
            .filter((question) => !AccessService.canUserAccess(question.quiz, req.requester.id))
            .map((question) => question.id);

        if (cantAccessQuestionIds.length !== 0) {
            return res.forbidden(`You must be the owner of the quizzes ${cantAccessQuestionIds} to delete them`);
        }

        const deletedCount = await QuestionService.deleteQuestions(req.body.questionIds);

        res.ok({ deletedCount });
    }

    @Get('/:questionId')
    @Validate({ param: QuestionIdModel })
    public async getQuestionById(req: Request<QuestionId>, res: Response) {
        const question = await QuestionService.getQuestionWithQuizById(req.params.questionId);

        if (!AccessService.canUserAccess(question.quiz, req.requester.id)) {
            throw new ForbiddenError(`You do not have access to the quiz question ${req.params.questionId}`);
        }

        res.ok(questionDto(question));
    }

    @Patch('/:questionId')
    @Validate({ param: QuestionIdModel, body: UpdateQuestionModel })
    public async updateQuestionById(req: Request<QuestionId, unknown, UpdateQuestion>, res: Response) {
        const question = await QuestionService.getQuestionWithQuizById(req.params.questionId);

        if (!AccessService.canUserModify(question.quiz, req.requester.id)) {
            return res.forbidden('Only the owner can update a quiz question');
        }

        const updatedQuestion = await QuestionService.updateQuestionById(question, req.params.questionId, req.body);

        res.ok(updatedQuestion);
    }

    @Delete('/:questionId')
    @Validate({ param: QuestionIdModel })
    public async deleteQuizQuestion(req: Request<QuestionId>, res: Response) {
        const question = await QuestionService.getQuestionWithQuizById(req.params.questionId);

        if (!AccessService.canUserModify(question.quiz, req.requester.id)) {
            return res.forbidden('Only the owner can delete a quiz question');
        }

        await QuestionService.deleteQuestion(question.id);
        res.noContent();
    }

    @Patch('/:questionId/stats')
    @Validate({ param: QuestionIdModel, body: UpdateQuestionStatsModel })
    public async updateQuestionStats(req: Request<QuestionId, unknown, UpdateQuestionStats>, res: Response) {
        const question = await QuestionService.getQuestionWithQuizById(req.params.questionId);

        if (!AccessService.canUserAccess(question.quiz, req.requester.id)) {
            return res.forbidden(`You do not have access to the quiz question ${req.params.questionId}`);
        }

        const updatedQuestion = await QuestionService.updateQuestionStats(req.params.questionId, req.body);

        res.ok(updatedQuestion);
    }
}
