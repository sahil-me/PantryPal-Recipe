# 🍳 PantryPal - Recipe 🥗

https://github.com/user-attachments/assets/57b7f1a0-76a0-4554-809f-d55ab4993bcc

> 🎥 PantryPal Demonstration!

---

## Table of Contents

- [Introduction](#introduction)
- [Architecture Diagram](#architecture-diagram)
- [Project Structure](#project-structure)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Application Workflow](#application-workflow)
- [Screenshots](#screenshots)
- [AI-Assisted Development](#ai-assisted-development)
- [Future Enhancements](#future-enhancements)
- [Resources](#resources)
- [Disclaimer](#disclaimer)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Introduction

**PantryPal - Recipe** is a modern recipe discovery and kitchen management web application built with **React**, **TypeScript**, **Tailwind CSS**, and **Vite**.

The idea behind PantryPal is simple: help users discover recipes based on the ingredients they already have in their kitchen. Instead of choosing a recipe first and then purchasing a long list of ingredients, PantryPal follows a pantry-first approach, allowing users to search for recipes using available ingredients and  discover recipes that best match what they have.

The application integrates the **Spoonacular API** for recipe data and provides features such as ingredient-based recipe discovery, personal pantry management, favorites, weekly meal planning, user profiles and preferences, and an AI-powered recipe assistant.

For personalized functionality, PantryPal uses **Firebase Authentication** for user accounts and **Cloud Firestore** for storing user-specific data. Users can create an account or sign in using Email/Password or Google, allowing their preferences, pantry items, favorite recipes, and other personalized data to be retained across sessions.

The application is deployed on **Vercel**, with a server-side API layer handling external recipe-service requests.

---

## Architecture Diagram

The following diagram illustrates the high-level architecture of **PantryPal**, including the frontend application, authentication and data storage, backend API layer, external recipe services, and AI assistant.

<img width="928" height="756" alt="PantryPal" src="https://github.com/user-attachments/assets/796fb769-7d6f-49aa-8ab8-33117ff09ac2" />

---

## Project Structure

```text
PantryPal-Recipe/
│
├── api/
│   └── index.ts                 # Serverless API entry point
│
├── src/
│   ├── assets/
│   │   └── images/              # Recipe and application images
│   ├── components/              # Reusable React UI components
│   ├── context/                 # Application and authentication state
│   ├── data/                    # Local application data and fallbacks
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Firebase and library configurations
│   ├── pages/                   # Application pages and views
│   ├── services/                # API and external service integrations
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Utility and helper functions
│   ├── App.tsx                  # Root React component
│   ├── index.css                # Global application styles
|   ├── main.tsx                 # Application entry point
|   ├── setupTests.ts            # Test environment setup
|   └── vite-env.d.ts            # Vite TypeScript declarations
│
├── .env.example                 # Environment variable template
├── .gitignore                   # Git ignored files and directories
├── CODE_OF_CONDUCT.md           # Contributor Code of Conduct
├── CONTRIBUTING.md              # Contribution guidelines
├── DESIGN_SYSTEM.md             # UI and design system documentation
├── LICENSE                      # Project license
├── README.md                    # Project documentation
├── SECURITY.md                  # Security policy and vulnerability reporting
├── bun.lock                     # Dependency lockfile
├── firebase-applet-config.json  # Firebase configuration metadata
├── firebase-blueprint.json      # Firebase project configuration
├── firestore.rules              # Cloud Firestore security rules
├── index.html                   # HTML entry point
├── metadata.json                # Application metadata
├── package.json                 # Dependencies and project scripts
├── server.ts                    # Express server and API logic
├── tsconfig.json                # TypeScript configuration
├── vercel.json                  # Vercel API routing configuration
└── vite.config.ts               # Vite configuration
```

> The src/ directory contains the main React application, while the api/ and server.ts files provide the server-side API functionality. Root-level configuration and documentation files manage deployment, Firebase, development tooling, security, licensing, and project standards.

---

## Features

- **Ingredient-Based Recipe Discovery:** Discover recipes based on the ingredients currently available in the pantry or kitchen, with match percentages showing how closely each recipe matches the selected ingredients.
- **Recipe Search and Filtering:** Search for recipes and refine results using meal type, cooking time, dietary preferences, and other available filters.
- **Pantry Management:** Maintain a personal pantry by adding, removing, and managing available ingredients for recipe discovery.
- **Favorites and Saved Recipes:** Save recipes to favorites for quick access and maintain a personalized collection of preferred recipes.
- **Weekly Meal Planner:** Organize selected recipes throughout the week using the meal planning functionality.
- **Shopping List:** Track missing ingredients from recipes and manage them through an interactive shopping list.
- **User Accounts and Personalization:** Create an account or sign in using **Email/Password or Google** through Firebase Authentication. User-specific preferences, pantry items, favorites, and planner data are stored using Cloud Firestore.
- **AI-Powered Recipe Assistant:** Use the **Google Gemini API** for recipe-related assistance, including ingredient substitutions, recipe modifications, and other cooking-related guidance.
- **Recipe Data Integration:** Fetch recipe information through the **Spoonacular API**, with the application handling recipe search and ingredient-based matching.
- **Responsive Web Interface:** A responsive React-based interface designed to provide a consistent experience across desktop and mobile screen sizes.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Primary programming language |
| **React** | Frontend UI framework |
| **Vite** | Development server and production build tool |
| **Tailwind CSS** | Utility-first CSS framework for styling |
| **Lucide React** | Icon library for the user interface |
| **Motion** | UI animations and transitions |
| **Node.js** | Server-side JavaScript runtime |
| **Express** | Server-side API layer for external service requests |
| **Firebase Authentication** | User authentication with Email/Password and Google Sign-In |
| **Cloud Firestore** | Cloud database for user-specific application data |
| **Spoonacular API** | Recipe and ingredient data |
| **Google Gemini API** | AI-powered recipe assistance |
| **Vitest** | Unit and application testing |
| **Git** | Version control |
| **GitHub** | Source code hosting and collaboration |
| **Vercel** | Production deployment and hosting |
| **Bun** | Dependency management and lockfile |
| **Google AI Studio** | AI-assisted application development |

---

## Application Workflow

**PantryPal** follows a pantry-first workflow that takes users from ingredient selection to recipe discovery, preparation, and meal planning.

1️⃣ **Authentication and User Session**

- Users can continue as guests or create an account using **Email/Password** or **Google Sign-In**.
- Authenticated users can persist their pantry items, favorite recipes, meal plans, and preferences using **Firebase Authentication** and **Cloud Firestore**.

2️⃣ **Ingredient Selection and Pantry Management**

- Users enter ingredients through the ingredient search interface.
- The application provides ingredient suggestions to make selection faster.
- Authenticated users can load ingredients from their **saved pantry**.
- Users can add, edit, remove, and manage ingredients in their pantry.

3️⃣ **Ingredient-to-Recipe Matching**

- The selected ingredients are sent to the server-side API for recipe search.
- The backend retrieves recipe data from the **Spoonacular API**.
- Recipes are evaluated based on the ingredients available to the user.
- Results are ranked according to their **match percentage**, helping users identify recipes they can make with the ingredients they already have.

4️⃣ **Recipe Discovery and Filtering**

- Matching recipes are displayed as recipe cards with relevant information such as match percentage, meal category, preparation time, and difficulty.
- Users can refine results using available filters such as:
  - **Meal Type**
  - **Dietary Preferences**
  - **Cooking Time**
  - **Match Criteria**
- This allows users to quickly narrow the results to recipes that fit their requirements.

5️⃣ **Detailed Recipe View**

- Selecting a recipe opens its detailed recipe view.
- Users can compare available ingredients with the ingredients required by the recipe.
- Missing ingredients can be identified and added to the shopping list.
- Users can adjust serving sizes and view nutritional information.
- The recipe view also provides step-by-step cooking instructions.

6️⃣ **AI-Powered Recipe Assistant**

- Users can access the **Google Gemini-powered recipe assistant** while viewing a recipe.
- The assistant uses the recipe context to provide cooking-related guidance.
- Users can ask questions about ingredient substitutions, recipe modifications, preparation steps, and other cooking-related advice.

7️⃣ **Smart Shopping List**

- Missing ingredients from a recipe can be added directly to the **shopping list**.
- Users can manage the list by checking off purchased items and adding or removing ingredients as needed.

8️⃣ **Favorites and Weekly Meal Planner**

- Users can save recipes to their **Favorites** for quick access later.
- The **Weekly Meal Planner** allows users to assign recipes to specific days and meal slots throughout the week.
- Saved favorites and meal plans are synchronized for authenticated users through **Cloud Firestore**.

---

## Screenshots

### Account Creation

<img width="1366" alt="PantryPal Account Creation" src="https://github.com/user-attachments/assets/0c5fdf5c-5583-4dba-8fb7-ef5ee5c0010c" />

### Firebase Authentication

<img width="1366" alt="PantryPal Firebase Authentication" src="https://github.com/user-attachments/assets/c3e554f5-2eea-4c17-9342-83bc105e41b2" />

### Firebase Cloud Firestore

<img width="1366" alt="PantryPal Cloud Firestore Usage" src="https://github.com/user-attachments/assets/3eed2ac0-b7c7-4636-8ca1-f5ae0021c140" />

<img width="1366" alt="PantryPal Cloud Firestore Rules Metrics" src="https://github.com/user-attachments/assets/cba53708-a7cd-45ba-8bc3-ee0a7470453a" />

<img width="1366" alt="PantryPal Cloud Firestore Query Insights" src="https://github.com/user-attachments/assets/6a4af62a-38bd-4d9f-bb89-aa4f558d0860" />

### Profile & Preferences

<img width="1366" alt="PantryPal Profile and Preferences" src="https://github.com/user-attachments/assets/cbd240e4-9eb9-431e-972d-a900ad8eb87b" />

### Recipe Discovery

<img width="1366" alt="PantryPal Recipe Discovery" src="https://github.com/user-attachments/assets/b1c0c0a4-8381-41b8-a496-8a0878dbd3e3" />

### My Pantry

<img width="1366" alt="PantryPal My Pantry" src="https://github.com/user-attachments/assets/3096d9bd-d5c4-4071-97aa-22235e2b64c8" />

### Recipe Results

<img width="1366" alt="PantryPal Recipe Results" src="https://github.com/user-attachments/assets/73dd70f5-c077-4532-a076-e92277180020" />

### Recipe Overview

<img width="1366" alt="PantryPal Recipe Overview" src="https://github.com/user-attachments/assets/1299fddd-b932-422d-bcc8-30a404e3728d" />

### Spoonacular API

<img width="1366" alt="PantryPal Spoonacular API Dashboard" src="https://github.com/user-attachments/assets/c56a0a33-72a0-4138-8d95-1a419d129824" />

<img width="1366" alt="PantryPal Spoonacular API Usage" src="https://github.com/user-attachments/assets/3295e91e-36f5-49d7-aede-5782daf5717a" />

### Smart Shopping List

<img width="1366" alt="PantryPal Smart Shopping List" src="https://github.com/user-attachments/assets/552c5e08-8e71-42cc-b002-94837d30e98c" />

### AI Recipe Assistant

<img width="1366" alt="PantryPal AI Recipe Assistant" src="https://github.com/user-attachments/assets/e317b257-f0e3-40eb-a7c0-56086db7627b" />

### Favorites

<img width="1366" alt="PantryPal Favorites" src="https://github.com/user-attachments/assets/5f4c5042-a0b6-44a0-8d80-04322bf56e96" />

### Weekly Meal Planner

<img width="1366" alt="PantryPal Weekly Meal Planner" src="https://github.com/user-attachments/assets/78831fc0-baa1-45a4-ab5a-aa5970c6e33a" />

### Account Deletion

<img width="1366" alt="PantryPal Account Deletion Confirmation" src="https://github.com/user-attachments/assets/61e39b82-d613-478d-b789-e0e689930ea4" />

<img width="1366" alt="PantryPal Firebase Authentication After Account Deletion" src="https://github.com/user-attachments/assets/38c0194e-e981-4995-bb72-37cc26e33fb1" />

---

## AI-Assisted Development

**PantryPal** was initially developed with the assistance of **Google AI Studio** and **Gemini** during the early stages of the project.

AI assistance was used to support areas such as application structure, component development, UI implementation, debugging, and development guidance. The generated suggestions and code were subsequently reviewed, modified, integrated, and tested as part of the development process.

The final application reflects the project's implemented architecture, features, integrations, and deployment configuration, including **React**, **TypeScript**, **Firebase**, **Spoonacular API**, **Google Gemini API**, **Express**, and **Vercel**.

---

## Future Enhancements

The following improvements could be considered in future iterations of **PantryPal**:

- **Advanced Recipe Recommendations**: Improve recipe ranking and recommendations using user preferences, cooking history, and favorite recipes.
- **Personalized Meal Recommendations**: Suggest weekly meal plans based on available pantry ingredients, dietary preferences, and previously saved recipes.
- **Enhanced Pantry Intelligence**: Add ingredient quantity tracking, expiration dates, and notifications to help users reduce food waste.
- **Improved Shopping List Management**: Add grocery categories, quantity tracking, and smarter grouping of missing ingredients.
- **AI-Powered Personalization**: Expand the Gemini-powered assistant to provide more personalized recipe suggestions, meal planning, and cooking guidance.
- **Recipe Collections**: Allow users to organize saved recipes into custom collections.
- **Advanced Search and Filtering**: Introduce additional filters and more precise recipe discovery options.
- **Performance Optimization**: Further optimize API requests, caching, and application loading performance.
- **Accessibility Improvements**: Continue improving keyboard navigation, screen-reader support, and overall accessibility.
- **Progressive Web App (PWA)**: Add PWA capabilities to provide an improved mobile experience and offline support where applicable.

---

## Resources

[![React | Documentation](https://img.shields.io/badge/React-Documentation-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript | Documentation](https://img.shields.io/badge/TypeScript-Documentation-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/docs/)
[![Vite | Guide](https://img.shields.io/badge/Vite-Guide-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/guide/)
[![Tailwind CSS | Documentation](https://img.shields.io/badge/Tailwind_CSS-Documentation-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/docs)
[![Firebase | Documentation](https://img.shields.io/badge/Firebase-Documentation-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/docs)
[![Spoonacular | API Documentation](https://img.shields.io/badge/Spoonacular-API_Documentation-5BAE45?style=for-the-badge)](https://spoonacular.com/food-api/docs)
[![Google Gemini | Documentation](https://img.shields.io/badge/Google_Gemini-Documentation-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/gemini-api/docs)
[![Express | Documentation](https://img.shields.io/badge/Express-Documentation-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vercel | Documentation](https://img.shields.io/badge/Vercel-Documentation-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/docs)

---

## Disclaimer

**PantryPal - Recipe** is a recipe discovery and kitchen management application developed for learning, experimentation, and demonstration purposes.

The application uses third-party services, including the **Spoonacular API**, **Firebase**, and **Google Gemini API**. Recipe information, images, AI-generated responses, authentication services, and other third-party content or functionality may be subject to the respective providers' terms of service, licenses, usage limits, and policies.

PantryPal does not claim ownership of third-party recipe data, images, or other externally provided content. The availability, accuracy, and continued operation of third-party services are dependent on their respective providers.

Users should review the applicable terms, licenses, and policies of third-party services when using PantryPal.

The project is provided "as is" without warranties of any kind, to the extent permitted by applicable law.

---

## Contributing

Contributions are welcome. Before submitting changes, please review:

- [Contributing Guide](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security Policy](./SECURITY.md)

---

## License

This project is licensed under the **Apache License 2.0**.

See the [**LICENSE**](./LICENSE) file for details.

---

## Author

[**Sahil Sharma**](https://github.com/sahil-me)

Thank you for exploring **PantryPal - Recipe**. If you found the project useful, consider giving the repository a ⭐ to show your support.

