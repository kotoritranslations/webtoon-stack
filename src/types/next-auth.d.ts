// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      username?: string | null;
      isCreator?: boolean;
      displayName?: string | null;
      avatar?: string | null;
      isNewUser?: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    username?: string | null;
    isCreator?: boolean;
    displayName?: string | null;
    avatar?: string | null;
    isNewUser?: boolean;
  }
}