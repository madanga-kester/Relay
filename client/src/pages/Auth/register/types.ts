export type Role = "advertiser" | "community-owner";

export type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirm: string;
};