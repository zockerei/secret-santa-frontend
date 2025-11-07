# Secret Santa Frontend

A modern web application for organizing Secret Santa gift exchanges.

## Features

- 🎅 User registration and authentication
- 🎁 Create and manage Secret Santa groups
- 👥 Participant management
- 🔀 Automatic gift assignment with exclusion rules
- 📝 Wishlist creation with markdown support
- 🌙 Dark mode support
- 📱 Responsive design

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

Create a production build:
```bash
npm run build
```

### Preview

Preview the production build locally:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable Vue components
├── composables/    # Vue composables (auth, toast)
├── utils/          # Utility functions (API client)
├── views/          # Page components
├── App.vue         # Root component
└── main.js         # Application entry point
```

## API Integration

The frontend connects to the Secret Santa backend API. Make sure the backend server is running and configure the API base URL in `src/utils/api.js`.
