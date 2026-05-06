export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = LoginCredentials & {
  displayName: string;
};

export type AuthMode = "login" | "register";
