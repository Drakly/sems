# SEMS Frontend

This is the frontend application for the Smart Expense Management System (SEMS). It's built with React, TypeScript, Redux, and Material UI.

## Features

- **Authentication**: Secure login/signup with JWT-based authentication
- **Dashboard**: Overview of expenses, approvals, and budget utilization with visualizations
- **Expense Management**: Create, edit, and track expenses
- **Approval Workflow**: Multi-level approval process with delegation and escalation
- **Budget Management**: Track and manage budgets
- **Reporting**: Generate custom reports with various export options

## Tech Stack

- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Redux Toolkit**: State management
- **Material UI**: Component library
- **Recharts**: Chart visualizations
- **Formik & Yup**: Form handling and validation
- **Axios**: HTTP client
- **React Router**: Navigation and routing

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
```bash
cd frontend/sems-ui
```
3. Install dependencies:
```bash
npm install
# or
yarn install
```
4. Start the development server:
```bash
npm start
# or
yarn start
```

The application will be available at http://localhost:3000.

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
REACT_APP_API_URL=http://localhost:8080/api/v1
```

## Project Structure

```
src/
├── components/        # UI components
│   ├── auth/          # Authentication components
│   ├── dashboard/     # Dashboard components
│   ├── expense/       # Expense management components
│   ├── approval/      # Approval workflow components
│   ├── budget/        # Budget management components
│   └── reports/       # Reporting components
├── layout/            # Layout components
├── services/          # API services
├── store/             # Redux store
│   └── slices/        # Redux slices
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── hooks/             # Custom hooks
```

## API Integration

The frontend integrates with the SEMS backend API endpoints for:

- User authentication
- Expense management
- Approval workflow
- Budget management
- Reporting

## Available Scripts

- `npm start`: Start development server
- `npm build`: Build production-ready app
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
