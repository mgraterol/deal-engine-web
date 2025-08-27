# README

This repository contains the frontend application for the Invo system, built with React and Vite. It provides the user interface and interacts with the backend API to manage business logic and data.

---

### **Setup the Application**

To install and get the project running, follow these steps:

* **Install Node.js**: Ensure you have Node.js (and npm or Yarn) installed on your system. We recommend using `nvm` or `asdf` to manage Node.js versions.
    * If using `asdf`, you can add the Node.js plugin: `asdf plugin add nodejs`
    * Then install the project's specified Node.js version: `asdf install`
* **Install Dependencies**: Install all project dependencies using your preferred package manager:
    `npm install`
    _or_
    `yarn install`
* **Environment Variables**: This project uses environment variables (e.g., for API endpoints). Create a `.env` file in the root of the project (e.g., `.env.local` for local development) and add necessary variables.
    * Example: `VITE_API_BASE_URL=http://localhost:3000/api/v1`

---

### **Run the Application**

To run the application, you can start a development server or build it for production.

* **Start Development Server**: This will launch the application in development mode with hot-module reloading:
    `npm run dev`
    _or_
    `yarn dev`
* **Build for Production**: This compiles and bundles the application for deployment:
    `npm run build`
    _or_
    `yarn build`
* **Preview Production Build**: After building, you can preview the production build locally:
    `npm run preview`
    _or_
    `yarn preview`
