export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string; // solo demo (no usar así en producción)
  }