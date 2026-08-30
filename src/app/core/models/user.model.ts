import { UserRoleEnum } from "../enums/user-role.enum";

export interface User {
    id: string;
    email: string;
    profile: {
        firstName: string;
        lastName: string;
    };
    role: UserRoleEnum;
}
