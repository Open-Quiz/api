import DTO from '../../utils/dto';
import { CompleteQuiz } from '../zod/quizModel';

export default function quizDto(quiz: CompleteQuiz) {
    return new DTO(quiz).selectEach('questions', (question) => question.exclude('quizId')).build();
}
