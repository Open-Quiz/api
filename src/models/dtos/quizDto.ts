import DTO from '../../utility/dto';
import { CompleteQuiz } from '../zod/quizModel';

export default function quizDto(quiz: CompleteQuiz) {
    return new DTO(quiz).selectEach('questions', (question) => question.exclude('quizId')).instance;
}

export type QuizDto = ReturnType<typeof quizDto>;
