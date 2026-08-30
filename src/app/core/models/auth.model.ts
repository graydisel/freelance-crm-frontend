export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    role: string;
  };
}
