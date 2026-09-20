export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IUser {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  role: string;
}

export interface IAuthResponse {
  access_token: string;
  user: IUser;
}

export type TAuthState = {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
};
