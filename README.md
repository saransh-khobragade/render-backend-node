# Expense Tracker Backend

Backend API for the Expense Tracker application built with Node.js, Express, and TypeScript.

## Features

- User authentication (register/login) with JWT
- File upload for Excel bank statements (.xls, .xlsx)
- XLS parser to extract transaction data
- Transaction management API
- Chart data endpoints for credit, debit, and expense categories
- In-memory storage (no database required)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```env
PORT=8080
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

3. Run the development server:
```bash
npm run dev
```

The server will start on `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Transactions
- `POST /api/transactions/upload` - Upload Excel bank statement (requires auth)
- `GET /api/transactions` - Get all transactions for authenticated user
- `GET /api/transactions/charts` - Get chart data (credits, debits, expenses)

## Project Structure

```
src/
  ├── server.ts           # Main server file
  ├── routes/            # API routes
  │   ├── auth.ts        # Authentication routes
  │   └── transactions.ts # Transaction routes
  ├── middleware/        # Express middleware
  │   └── auth.ts        # JWT authentication middleware
  ├── services/          # Business logic
  │   └── xlsParser.ts   # Excel file parser
  ├── storage/           # In-memory storage
  │   └── storage.ts     # Storage functions
  └── types/             # TypeScript types
      └── index.ts       # Type definitions
```


