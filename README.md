# Expense Tracker Backend

Backend API for the Expense Tracker application built with Node.js, Express, and TypeScript.

## Features

- File upload for Excel bank statements (.xls, .xlsx)
- XLS parser to extract transaction data from ICICI Bank statements
- Transaction management API
- Chart data endpoints for credit, debit, and expense categories
- In-memory storage (no database required)
- No authentication required (simplified for development)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional):
```env
PORT=8080
NODE_ENV=development
```

3. Run the development server:
```bash
npm run dev
```

The server will start on `http://localhost:8080`

## API Endpoints

### Health Check
- `GET /api/health` - Health check endpoint

### Transactions
- `POST /api/transactions/upload` - Upload Excel bank statement (no auth required)
- `GET /api/transactions` - Get all transactions (no auth required)
- `GET /api/transactions/charts` - Get chart data (credits, debits, expenses)

## Request/Response Examples

### Upload File
```bash
curl -X POST http://localhost:8080/api/transactions/upload \
  -F "file=@statement.xls"
```

### Get Chart Data
```bash
curl http://localhost:8080/api/transactions/charts
```

## Project Structure

```
src/
  ├── server.ts           # Main server file
  ├── routes/             # API routes
  │   └── transactions.ts # Transaction routes
  ├── services/           # Business logic
  │   └── xlsParser.ts    # Excel file parser
  ├── storage/            # In-memory storage
  │   └── storage.ts      # Storage functions
  └── types/             # TypeScript types
      └── index.ts        # Type definitions
```

## Notes

- The backend uses in-memory storage, so data will be lost on server restart
- The XLS parser is designed to work with ICICI Bank statement format
- Transactions are automatically categorized (UPI Payment, Cash Withdrawal, Bill Payment, etc.)
- All endpoints are publicly accessible (no authentication)
