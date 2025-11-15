# LexiSlide: AI-Powered Presentation Translator
LexiSlide is a sophisticated, AI-driven web application for the specialized translation of presentation content. It translates English text to professional, domain-specific Persian while preserving 100% of the original PowerPoint formatting. The system uses a "smart translation" approach, discerning between descriptive content for translation and elements like titles or captions that should remain unchanged. It automatically applies correct Persian fonts and RTL alignment, and generates a PDF terminology report.
## ✨ Key Features
- **🧠 AI-Powered Smart Translation:** Utilizes Google Gemini for context-aware, domain-specific translations directly in your browser.
- **🎯 Selective Content Translation:** Intelligently translates only descriptive body text, preserving titles, captions, and data labels.
- **🎨 100% Formatting Preservation:** Maintains the original PowerPoint file's layout, styling, images, and charts.
- **✒️ Automatic Persian Formatting:** Applies appropriate Persian fonts and ensures correct right-to-left (RTL) alignment.
- **📄 PDF Terminology Report:** Generates a downloadable PDF glossary of specialized terms.
- **🚀 Stunning User Experience:** A clean, modern, and responsive single-page interface with a seamless workflow.
- **🔒 Purely Client-Side:** All processing happens in your browser. Your files and API key are never sent to a server.
## 🏗️ Architecture
The application is a pure static single-page application (SPA). All logic, from file processing to AI API calls, is executed on the client-side. The data flow is simple:
**User (React Frontend) → Google AI API → Gemini AI Model**
For a visual representation, please see the in-app architecture diagram accessible via the **Code (`</>`)** icon in the header.
## 🛠️ Technology Stack
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Zustand
- **AI:** Google AI SDK (via `@google/generative-ai`)
- **File Processing:** JSZip, jspdf
## ��� Getting Started
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
### Running the Development Server
Start the local Vite development server:
```bash
bun run dev
```
The application will be available at `http://localhost:3000`. You will be prompted to enter your Google AI Studio API key in the UI to use the application.
## 🧪 Testing Strategy
-   **Unit Tests:** Key business logic, especially within the `pptx-processor.ts` module, should be covered by unit tests to validate text extraction, filtering, and replacement algorithms.
-   **End-to-End (E2E) Tests:** Manual E2E testing is recommended. This involves uploading various sample `.pptx` files to verify the entire workflow, from API key validation to downloading the final translated files.
## 🗺️ Roadmap
Potential future enhancements for LexiSlide include:
-   **DOCX Support:** Extend the processing engine to support Microsoft Word documents.
-   **Interactive Translation Editor:** Allow users to review and edit AI-generated translations before finalizing the document.
-   **Multi-Language Support:** Expand translation capabilities to other languages beyond Persian.
-   **Custom Glossaries:** Enable users to upload custom terminology glossaries to guide the AI's translation choices.
## 📦 Deployment
This project is a static site and can be deployed to any static hosting provider (e.g., GitHub Pages, Vercel, Netlify, Cloudflare Pages).
1.  **Build the application:**
    ```bash
    bun run build
    ```
2.  **Deploy the `dist` directory:**
    Upload the contents of the generated `dist` folder to your hosting provider.