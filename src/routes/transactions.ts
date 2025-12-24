import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { transactionStorage } from '../storage/storage.js';
import { parseBankStatement, convertToTransactions } from '../services/xlsParser.js';
import type { TransactionResponse, ChartData } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(__dirname, '../../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.xls');
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.originalname.endsWith('.xls') ||
      file.originalname.endsWith('.xlsx')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Upload and parse XLS file
router.post(
  '/upload',
  upload.single('file'),
  async (req: express.Request, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        } as TransactionResponse);
      }

      const userId = 'default-user'; // Single user for now

      // Delete existing transactions
      transactionStorage.deleteByUserId(userId);

      // Parse the XLS file
      const parsedTransactions = parseBankStatement(req.file.path);
      
      if (parsedTransactions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No transactions found in the file',
        } as TransactionResponse);
      }

      // Convert to Transaction objects
      const transactions = convertToTransactions(parsedTransactions, userId);

      // Store transactions
      transactionStorage.createMany(transactions);

      res.json({
        success: true,
        data: transactions,
        message: `Successfully imported ${transactions.length} transactions`,
      } as TransactionResponse);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process file',
      } as TransactionResponse);
    }
  }
);

// Get all transactions
router.get('/', (req: express.Request, res) => {
  try {
    const userId = 'default-user';
    const transactions = transactionStorage.findByUserId(userId);

    res.json({
      success: true,
      data: transactions,
    } as TransactionResponse);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
    } as TransactionResponse);
  }
});

// Get chart data
router.get('/charts', (req: express.Request, res) => {
  try {
    const userId = 'default-user';
    const transactions = transactionStorage.findByUserId(userId);

    // Group credits by date
    const creditsByDate = new Map<string, number>();
    transactions
      .filter((t) => t.type === 'credit')
      .forEach((t) => {
        const date = t.date;
        creditsByDate.set(date, (creditsByDate.get(date) || 0) + t.amount);
      });

    // Group debits by date
    const debitsByDate = new Map<string, number>();
    transactions
      .filter((t) => t.type === 'debit')
      .forEach((t) => {
        const date = t.date;
        debitsByDate.set(date, (debitsByDate.get(date) || 0) + t.amount);
      });

    // Group expenses by category
    const expensesByCategory = new Map<string, number>();
    transactions
      .filter((t) => t.type === 'debit')
      .forEach((t) => {
        const category = t.category || 'Other';
        expensesByCategory.set(category, (expensesByCategory.get(category) || 0) + t.amount);
      });

    const credits = Array.from(creditsByDate.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const debits = Array.from(debitsByDate.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const expenses = Array.from(expensesByCategory.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    res.json({
      success: true,
      data: {
        credits,
        debits,
        expenses,
      },
    } as ChartData);
  } catch (error) {
    console.error('Get chart data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chart data',
    } as ChartData);
  }
});

export default router;


