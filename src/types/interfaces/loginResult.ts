import { CompleteUser } from '../../models/zod/userModel';

export default interface LoginResult {
    user: CompleteUser;
    wasSignedUp: boolean;
}
