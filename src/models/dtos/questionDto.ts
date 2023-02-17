import { Quiz, QuizQuestion } from '@prisma/client';
import DTO from '../../utility/dto';

export default function questionDto(question: QuizQuestion & { quiz: Quiz }): QuizQuestion {
    return new DTO(question).exclude('quiz').build();
}
