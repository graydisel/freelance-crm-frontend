import { UserRoleEnum } from "../enums/user-role.enum";

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRoleEnum;
}
