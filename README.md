# 🍳 PantryPal - Recipe 🥗



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



---

## Application Workflow



---

## Screenshots



---

## AI-Assisted Development



---

## Future Enhancements



---

## Resources



---

## Disclaimer



---

## Contributing



---

## License



---

## Author


