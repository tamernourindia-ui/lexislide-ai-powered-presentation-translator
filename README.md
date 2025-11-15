# LexiSlide: AI-Powered Presentation Translator
[cloudflarebutton]
LexiSlide is a sophisticated, AI-driven web application for the specialized translation of presentation content. It translates English text to professional, domain-specific Persian while preserving 100% of the original PowerPoint formatting. The system uses a "smart translation" approach, discerning between descriptive content for translation and elements like titles or captions that should remain unchanged. It automatically applies correct Persian fonts and RTL alignment, and generates a PDF terminology report.
## ✨ Key Features
- **🧠 AI-Powered Smart Translation:** Utilizes advanced AI for context-aware, domain-specific translations.
- **🎯 Selective Content Translation:** Intelligently translates only descriptive body text, preserving titles, captions, and data labels.
- **🎨 100% Formatting Preservation:** Maintains the original PowerPoint file's layout, styling, images, and charts.
- **✒️ Automatic Persian Formatting:** Applies appropriate Persian fonts and ensures correct right-to-left (RTL) alignment.
- **📄 PDF Terminology Report:** Generates a downloadable PDF glossary of specialized terms.
- **🚀 Stunning User Experience:** A clean, modern, and responsive single-page interface with a seamless workflow.
- **☁️ Built on Cloudflare:** Leverages Cloudflare Workers and Durable Objects for scalable backend processing.
## 🏗️ Architecture
The application follows a modern serverless architecture. For a visual representation of the data flow from the user to the AI model, please see the in-app architecture diagram accessible via the **Code (`</>`)** icon in the header.
## ��️ Technology Stack
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Zustand
- **Backend:** Cloudflare Workers, Hono, Durable Objects
- **AI:** Cloudflare AI Gateway, Google Gemini
## 🚀 Getting Started
### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)
- [Bun](https://bun.sh/)
### Installation & Setup
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/lexislide-ai-translator.git
    cd lexislide-ai-translator
    ```
2.  **Install dependencies:**
    ```bash
    bun install
    ```
3.  **Set up local environment variables:**
    Create a `.dev.vars` file in the project root. You will need to add your Cloudflare AI Gateway credentials.
    ```ini
    # .dev.vars
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    ```
    *Note: The API Key is provided by the user through the UI in this application version.*
### Running the Development Server
Start the local development server, which includes the Vite frontend and the Cloudflare Worker backend:
```bash
bun run dev
```
The application will be available at `http://localhost:3000`.
## 🧪 Testing Strategy
-   **Unit Tests:** Key business logic, especially within the `pptx-processor.ts` module, should be covered by unit tests to validate text extraction, filtering, and replacement algorithms.
-   **Integration Tests:** The interaction between the frontend state management (Zustand) and the Cloudflare Worker endpoints (`/api/validate-key`, `/api/translate`) should be tested to ensure data flows correctly.
-   **End-to-End (E2E) Tests:** Manual E2E testing is recommended. This involves uploading various sample `.pptx` files (including those with complex formatting, multiple text runs, and different languages) to verify the entire workflow, from API key validation to downloading the final translated files.
## 🗺️ Roadmap
Potential future enhancements for LexiSlide include:
-   **DOCX Support:** Extend the processing engine to support Microsoft Word documents.
-   **Interactive Translation Editor:** Allow users to review and edit AI-generated translations before finalizing the document.
-   **Multi-Language Support:** Expand translation capabilities to other languages beyond Persian.
-   **Custom Glossaries:** Enable users to upload custom terminology glossaries to guide the AI's translation choices.
## 📦 Deployment
This project is designed for seamless deployment to Cloudflare's global network.
1.  **Login to Wrangler:**
    ```bash
    bunx wrangler login
    ```
2.  **Deploy the application:**
    ```bash
    bun run deploy
    ```
    *Note: Secrets like `CF_AI_API_KEY` are not required for deployment as the key is provided by the end-user.*
Alternatively, deploy directly from your GitHub repository with a single click.
[cloudflarebutton]