export type AdminMode = 'super-admin' | 'normal';

export interface AdminData {
  email: string;
  password: string;
  name: string;
  phone: string;
  avatarFile?: File | null;
}