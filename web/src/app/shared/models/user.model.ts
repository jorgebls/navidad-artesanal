export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentId: string;
  address: string;
  passwordHash: string; // solo demo (no usar así en producción)
}
