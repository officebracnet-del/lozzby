# Frontend App

A simple React + Vite frontend template for your application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

## Features

- Clean, minimal starting template
- Tailwind CSS for styling
- Ready to connect to your backend API
- Hot module replacement for fast development

## Connecting to Backend

To connect to your FastAPI backend, you can use `fetch` or a library like `axios`:

```javascript
// Example API call
const response = await fetch('http://localhost:8000/api/endpoint');
const data = await response.json();
```