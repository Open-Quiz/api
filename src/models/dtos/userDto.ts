import DTO from '../../utility/dto';
import { CompleteUser } from '../zod/userModel';

export default function userDto(user: CompleteUser) {
    return new DTO(user).select('data', (data) => (data.isNotNull() ? data.exclude('userId') : data)).instance;
}

export type UserDto = ReturnType<typeof userDto>;
