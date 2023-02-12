import { BadRequestErrorMessage } from '../types/expressAugmentation';
import { CreateQuizQuestion } from '../zod';

export namespace QuizQuestionService {
    export function isInvalid(quizQuestion: Omit<CreateQuizQuestion, 'quizId'>): BadRequestErrorMessage | undefined {
        if (quizQuestion.correctOption >= quizQuestion.options.length) {
            return { path: 'correctOption', message: 'The correct option must be an index of options' };
        }
    }
}
