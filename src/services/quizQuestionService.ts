import { BadRequestError } from '../types/response';
import { CreateQuizQuestion } from '../zod';

export namespace QuizQuestionService {
    export function isInValid(quizQuestion: Omit<CreateQuizQuestion, 'quizId'>): BadRequestError | undefined {
        if (quizQuestion.correctOption >= quizQuestion.options.length) {
            return { path: 'correctOption', message: 'The correct option must be an index of options' };
        }
    }
}
