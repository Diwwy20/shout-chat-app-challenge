# Mini Chat App with Ollama 🤖

A real-time Full-Stack Chat Web Application that integrates with a local LLM (Ollama) to provide AI responses. This project is developed as part of the **Full-Stack Chat Challenge**.

## 🚀 Features

- **Real-time Chat:** Send messages and receive AI responses instantly.
- **Smart Interactions:**
    - **Stop Generation:** Users can halt the AI's response mid-stream instantly.
    - **Atomic Edit & Regenerate:** Sophisticated server-side logic allows users to edit past messages. The system automatically updates the context, clears future messages, and regenerates the AI response in a single atomic operation to ensure conversation consistency.
    - **Copy to Clipboard:** Quickly copy user or AI messages with a single click.
- **Theme Support:** Fully responsive **Light & Dark Mode** for comfortable viewing.
- **Session Management:** Easily clear the entire conversation history to start fresh.
- **Data Persistence:** Chat history is stored in MongoDB, ensuring conversations are saved across sessions.
- **Local AI:** Powered by **Ollama**, ensuring data privacy and local processing.
- **Robust Backend:** Built with Node.js & Express using a layered architecture.

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 16.0.8 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** Shadcn UI
- **State Management:** React Custom Hooks
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js (v22.19.0 recommended)
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **AI Integration:** Ollama API
- **Architecture:** Layered Architecture (Controller, Service, Repository)

---

## ⚙️ Prerequisites

Before running the application, ensure you have the following installed:

1.  **Node.js**: Version 22.19.0 or higher (Managed via `nvm` is recommended).
2.  **MongoDB**: Local instance or MongoDB Atlas connection string.
3.  **Ollama**: Download from [ollama.com](https://ollama.com/).

### Setting up Ollama Model
This project is configured to use `gemma3:12b` by default.

1.  Install Ollama and ensure it's running.
2.  Pull the model:
    ```bash
    ollama pull gemma3:12b
    ```

> **Note:** If you wish to use a different model (e.g., `llama3`, `mistral`), update the `OLLAMA_MODEL` variable in the backend `.env` file and ensure you pull that specific model via Ollama CLI.

**Alternative Models & Hardware Requirements:**
Ensure your machine has enough RAM. For 12B models, ~16GB RAM is recommended. If you have lower specs, consider smaller models like `gemma3:1b` or `llama3.2:1b`.

- **Browse available models:** [Ollama Library](https://ollama.com/library)
- **View model memory requirements:** [Ollama GitHub](https://github.com/ollama/ollama) (See the "Model" section for RAM guidelines)

---

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Diwwy20/shout-chat-app-challenge
cd shout-chat-app-challenge
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Configuration (.env): Create a .env file in the backend directory. For the purpose of this challenge evaluation, you can use the following default configuration:
```language
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/shout-chat
OLLAMA_API_URL=http://127.0.0.1:11434/api/chat
OLLAMA_MODEL=gemma3:12b  # You can change the model here (e.g., llama3, mistral)
CLIENT_URL=http://localhost:3000
```
Start the Server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
Open a new terminal via the root directory:
```bash
cd frontend
npm install
```

Configuration (.env): Create a .env file in the frontend directory:
```language
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
Start the Application:
```bash
npm run dev
# Application runs on http://localhost:3000
```

## Project Architecture & Design Decisions
#### Backend Structure
I implemented a **Layered Architecture** (Controller-Service-Repository) pattern to ensure separation of concerns and maintainability.
```
backend/src/
├── config/          # Database & Environment configs
├── controllers/     # Handles incoming HTTP requests and responses
├── interfaces/      # Service contracts (e.g., IAIService) & Payload types
├── middleware/      # Centralized Error Handling & Zod Request Validation
├── models/          # Mongoose Schemas (Data Layer)
├── repositories/    # Database interactions (DAL) - abstracts DB logic
├── routes/          # API Route definitions
├── services/        # Business logic & AI Integration (Ollama)
├── utils/           # Utility classes (AppError)
├── validators/      # Zod Schemas for strict input validation
└── app.ts           # Express app setup
└── server.ts        # Start Server
```

#### Frontend Structure
Using Next.js App Router with a feature-based folder structure.
State Management: Instead of using heavy libraries like Redux, I implemented a Custom Hook (`useChat`).

- Reason: The scope of the application (single chat session) is perfectly handled by React's local state. The custom hook encapsulates the logic for fetching history, sending messages, and handling loading states, keeping the UI components clean and reusable.
```
frontend/
├── app/
│   ├── layout.tsx
│   └── page.tsx         # Main Chat Interface (Single Page)
├── components/
│   ├── common/          # Shared components (ConfirmDialog, ThemeToggle)
│   ├── features/chat/   # Chat-specific components (Bubble, Input)
│   └── ui/              # Reusable Shadcn UI components
├── hooks/
│   └── useChat.ts       # Logic for chat operations
├── lib/                 # Core utilities & libraries
│   ├── axios.ts         # Centralized Axios instance
│   └── utils.ts         # Class merging utility (clsx + tailwind-merge)
├── public/              # Static assets (images, icons)
├── services/
│   └── chatService.ts   # API calls handling
└── types/
    └── chat.ts          # TypeScript interfaces
```

---

## 📝 API Endpoints
Base URL: `/api/chat`
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/history/:sessionId` | Retrieve full conversation history for a specific session. |
| `POST` | `/message` | Send a new message to AI and save the conversation context. |
| `PUT` | `/message/:messageId` | **Regenerate Message:** Update a user message, clear subsequent history, and trigger a fresh AI response. |
| `DELETE` | `/message/:messageId` | Delete a specific message by its ID. |
| `DELETE` | `/history/:sessionId` | Clear all chat history for a specific session. |

---

## 📸 Screenshots

<img width="1918" height="1077" alt="screen-1" src="https://github.com/user-attachments/assets/543cd4b9-0462-4284-84b0-8115a6ababa6" />

<img width="1916" height="1078" alt="screen-2" src="https://github.com/user-attachments/assets/90b51f4c-d2e8-4a8f-b9ea-e1aeabb37c0f" />

<img width="1918" height="1076" alt="screen-3" src="https://github.com/user-attachments/assets/6adf9bf6-5f41-407f-9b2e-1ac5a7401378" />




