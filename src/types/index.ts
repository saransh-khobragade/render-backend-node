export interface User {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  date: string;
  description: string;
  type: 'credit' | 'debit';
  amount: number;
  category?: string;
  createdAt: Date;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: Omit<User, 'password'>;
    token: string;
  };
  message?: string;
}

export interface TransactionResponse {
  success: boolean;
  data?: Transaction | Transaction[];
  message?: string;
}

export interface ChartData {
  success: boolean;
  data?: {
    credits: Array<{ date: string; amount: number }>;
    debits: Array<{ date: string; amount: number }>;
    expenses: Array<{ category: string; amount: number }>;
  };
  message?: string;
}


