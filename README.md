# LexiSlide: AI-Powered Presentation Translator

[cloudflarebutton]

LexiSlide is a sophisticated, AI-driven web application designed for the specialized translation of presentation content. The application provides a seamless user experience for translating text from English to professional, domain-specific Persian. Initially focusing on the field of Ophthalmology, the system leverages the power of advanced AI models like Gemini 2.5 Pro to not only translate but also understand the context provided by a source reference (e.g., a book or article). The core principle is 'smart translation': it intelligently discerns between descriptive content meant for translation and elements like titles, captions, and data labels that should remain in their original form. The final output aims to preserve the presentation's original layout and formatting while applying appropriate Persian fonts and right-to-left (RTL) alignment for translated text. Additionally, it generates a downloadable PDF glossary of specialized terms used in the translation. The user interface is designed to be visually stunning, intuitive, and provides real-time feedback on the translation process.

## ✨ Key Features

- **🧠 AI-Powered Smart Translation:** Utilizes advanced AI to provide context-aware, domain-specific translations from English to professional Persian.
- **🎯 Selective Content Translation:** Intelligently identifies and translates only descriptive body text, while preserving titles, headers, captions, and data within charts and tables.
- **🎨 100% Formatting Preservation:** Maintains the original PowerPoint file's layout, styling, images, and charts completely intact.
- **✒️ Automatic Persian Formatting:** Automatically applies appropriate Persian fonts and ensures all translated text is correctly aligned for right-to-left (RTL) reading.
- **📄 PDF Terminology Report:** Generates a downloadable PDF glossary of specialized terms and their translations used within the presentation.
- **🚀 Stunning User Experience:** A clean, modern, and fully responsive single-page interface with a seamless three-step workflow: Upload, Process, and Download.
- **☁️ Built on Cloudflare:** Leverages the power and scalability of Cloudflare Workers and Agents for backend processing.

## 🛠️ Technology Stack

- **Frontend:**
  - [React](https://react.dev/)
  - [Vite](https://vitejs.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [shadcn/ui](https://ui.shadcn.com/)
  - [Framer Motion](https://www.framer.com/motion/) for animations
  - [Zustand](https://zustand-demo.pmnd.rs/) for state management
  - [React Dropzone](https://react-dropzone.js.org/) for file uploads

- **Backend:**
  - [Cloudflare Workers](https://workers.cloudflare.com/)
  - [Hono](https://hono.dev/)
  - [Cloudflare Agents (Durable Objects)](https://developers.cloudflare.com/workers/runtime-apis/durable-objects/)

- **AI:**
  - [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/)
  - [Google Gemini](https://deepmind.google/technologies/gemini/)

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Bun](https://bun.sh/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/lexislide-ai-translator.git
    cd lexislide-ai-translator
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Set up environment variables:**
    Create a `.dev.vars` file in the root of the project for local development. You will need to add your Cloudflare AI Gateway credentials.

    ```ini
    # .dev.vars
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai"
    CF_AI_API_KEY="YOUR_CLOUDFLARE_API_KEY"
    ```

    Replace the placeholder values with your actual Cloudflare Account ID, Gateway ID, and API Key.

### Running the Development Server

To start the local development server, which includes both the Vite frontend and the Cloudflare Worker backend, run:

```bash
bun run dev
```

The application will be available at `http://localhost:3000`.

##  usage

The application is designed to be intuitive with a simple three-step process:

1.  **Upload & Configure:** Drag and drop your `.pptx` file into the upload area and enter the name of the source material (e.g., book or article title) to provide context for the AI.
2.  **Processing:** Click the "Translate" button. The application will show a real-time progress indicator as it analyzes the presentation, translates the content, and formats the new file.
3.  **Download:** Once processing is complete, you will be presented with download links for the translated `.pptx` file and the PDF terminology report.

## 📦 Deployment

This project is designed for seamless deployment to Cloudflare's global network.

1.  **Login to Wrangler:**
    If you haven't already, authenticate Wrangler with your Cloudflare account:
    ```bash
    bunx wrangler login
    ```

2.  **Configure Secrets:**
    Before deploying, you need to set your secrets for the production environment.
    ```bash
    bunx wrangler secret put CF_AI_BASE_URL
    bunx wrangler secret put CF_AI_API_KEY
    ```
    You will be prompted to enter the values for each secret.

3.  **Deploy the application:**
    Run the deploy script to build the application and deploy it to Cloudflare.
    ```bash
    bun run deploy
    ```

Alternatively, you can deploy directly from your GitHub repository with a single click.

[cloudflarebutton]

## 📂 Project Structure

-   `src/`: Contains all the frontend code, including React components, pages, hooks, and styles.
-   `worker/`: Contains the backend Cloudflare Worker code, including the Hono router, Agent (Durable Object) logic, and AI integration.
-   `wrangler.jsonc`: Configuration file for the Cloudflare Worker.
-   `vite.config.ts`: Configuration for the Vite development server and build process.

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.