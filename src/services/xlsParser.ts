import XLSX from 'xlsx';
import type { Transaction } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync } from 'fs';

interface ParsedTransaction {
  date: string;
  description: string;
  type: 'credit' | 'debit';
  amount: number;
}

export function parseBankStatement(filePath: string): ParsedTransaction[] {
  const fileBuffer = readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(worksheet, { raw: false }) as any[];
  
  const transactions: ParsedTransaction[] = [];
  
  // Find the row where transactions start (look for "Serial Number" or transaction data)
  let startIndex = 0;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const keys = Object.keys(row);
    
    // Look for transaction date column (usually contains dates like "24/12/2025")
    const dateKey = keys.find(key => {
      const value = String(row[key] || '').trim();
      return /^\d{1,2}\/\d{1,2}\/\d{4}/.test(value);
    });
    
    if (dateKey) {
      startIndex = i;
      break;
    }
  }
  
  // Parse transactions
  for (let i = startIndex; i < data.length; i++) {
    const row = data[i];
    const keys = Object.keys(row);
    
    // Find date column
    const dateKey = keys.find(key => {
      const value = String(row[key] || '').trim();
      return /^\d{1,2}\/\d{1,2}\/\d{4}/.test(value);
    });
    
    if (!dateKey) continue;
    
    const dateStr = String(row[dateKey] || '').trim();
    if (!dateStr || !/^\d{1,2}\/\d{1,2}\/\d{4}/.test(dateStr)) continue;
    
    // Find description column (usually the longest text field)
    const descriptionKey = keys.find(key => {
      const value = String(row[key] || '').trim();
      return value.length > 10 && key !== dateKey;
    }) || keys[keys.length - 2];
    
    // Find CR/DR column
    const typeKey = keys.find(key => {
      const value = String(row[key] || '').trim().toUpperCase();
      return value === 'CR.' || value === 'DR.' || value === 'CR' || value === 'DR';
    });
    
    // Find amount column (usually contains "INR" or numbers with commas)
    const amountKey = keys.find(key => {
      const value = String(row[key] || '').trim();
      return value.includes('INR') || /[\d,]+\.\d{2}/.test(value);
    }) || keys[keys.length - 1];
    
    if (!descriptionKey || !amountKey) continue;
    
    const description = String(row[descriptionKey] || '').trim();
    const typeStr = typeKey ? String(row[typeKey] || '').trim().toUpperCase() : '';
    const amountStr = String(row[amountKey] || '').trim();
    
    if (!description || !amountStr) continue;
    
    // Parse amount (remove "INR", commas, and extract number)
    const amountMatch = amountStr.match(/[\d,]+\.\d{2}/);
    if (!amountMatch) continue;
    
    const amount = parseFloat(amountMatch[0].replace(/,/g, ''));
    const type: 'credit' | 'debit' = typeStr.includes('CR') ? 'credit' : 'debit';
    
    // Parse date (DD/MM/YYYY)
    const [day, month, year] = dateStr.split('/');
    const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    transactions.push({
      date,
      description,
      type,
      amount,
    });
  }
  
  return transactions;
}

export function convertToTransactions(
  parsed: ParsedTransaction[],
  userId: string
): Transaction[] {
  return parsed.map((t) => ({
    id: uuidv4(),
    userId,
    date: t.date,
    description: t.description,
    type: t.type,
    amount: t.amount,
    category: categorizeTransaction(t.description),
    createdAt: new Date(),
  }));
}

function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase();
  
  if (desc.includes('upi') || desc.includes('paytm') || desc.includes('phonepe')) {
    return 'UPI Payment';
  }
  if (desc.includes('nfs') || desc.includes('cash') || desc.includes('atm')) {
    return 'Cash Withdrawal';
  }
  if (desc.includes('visa') || desc.includes('card')) {
    return 'Card Payment';
  }
  if (desc.includes('bill') || desc.includes('bpay') || desc.includes('bil')) {
    return 'Bill Payment';
  }
  if (desc.includes('amazon') || desc.includes('flipkart') || desc.includes('shopping')) {
    return 'Shopping';
  }
  if (desc.includes('refund')) {
    return 'Refund';
  }
  if (desc.includes('salary') || desc.includes('credit')) {
    return 'Income';
  }
  
  return 'Other';
}

