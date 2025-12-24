import type { User, Transaction } from '../types/index.js';

// In-memory storage
let users: User[] = [];
let transactions: Transaction[] = [];

export function initStorage() {
  // Initialize with empty arrays
  users = [];
  transactions = [];
  console.log('In-memory storage initialized');
}

export const userStorage = {
  create: (user: User): User => {
    users.push(user);
    return user;
  },

  findByEmail: (email: string): User | undefined => {
    return users.find((u) => u.email === email);
  },

  findById: (id: string): User | undefined => {
    return users.find((u) => u.id === id);
  },
};

export const transactionStorage = {
  create: (transaction: Transaction): Transaction => {
    transactions.push(transaction);
    return transaction;
  },

  createMany: (newTransactions: Transaction[]): Transaction[] => {
    transactions.push(...newTransactions);
    return newTransactions;
  },

  findByUserId: (userId: string): Transaction[] => {
    return transactions.filter((t) => t.userId === userId);
  },

  deleteByUserId: (userId: string): void => {
    transactions = transactions.filter((t) => t.userId !== userId);
  },
};


