
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email?: string;
    [key: string]: any;
  };
}


export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
  sub: string;
}
