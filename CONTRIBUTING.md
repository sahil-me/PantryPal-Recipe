<!---
Copyright 2026 Sahíl Sharma. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# Contribute to PantryPal - Recipe

Everyone is welcome to contribute, and we value every contribution. Code contributions are not the only way to support the project. Improving functionality, user experience, performance, architecture, security, testing, or documentation are all valuable ways to contribute to **PantryPal - Recipe**.

If you find this project helpful, consider sharing it with others, referencing it in your blogs or projects, discussing it on social platforms, or simply giving the repository a ⭐️ to support the project and the community.

**However you choose to contribute, please be mindful and respect our [Code of Conduct](https://github.com/sahil-me/PantryPal-Recipe/blob/main/CODE_OF_CONDUCT.md).**

## Ways to contribute

There are several ways you can contribute to **PantryPal - Recipe**.

* **Feature Development**: Add useful features such as improved recipe discovery, ingredient matching, pantry management, favorites, meal planning, shopping-list functionality, or user experience improvements.
* **Bug Fixes**: Identify and fix bugs or unexpected behavior in the application.
* **UI/UX Improvements**: Improve the application's usability, accessibility, responsive design, visual consistency, or overall user experience.
* **Performance Optimization**: Improve API response handling, frontend performance, loading times, caching, or overall application efficiency.
* **Security Improvements**: Help identify and address security issues related to authentication, API handling, data storage, input validation, or application configuration.
* **Documentation**: Improve the README, setup instructions, API documentation, or other project documentation.
* **Testing**: Add or improve unit, integration, or end-to-end tests to improve application reliability.

> All contributions are equally valuable to the project and community. 🥰

## Submitting a bug-related issue or feature request

At any moment, feel free to open an issue, including relevant error logs, screenshots, browser information, and dependency versions if it is related to a bug.

Please check the existing issues before creating a new one. This helps avoid duplicate reports and makes it easier to track existing problems.

### Did you find a bug?

**PantryPal - Recipe** becomes more reliable through community feedback, issue reporting, and meaningful contributions.

Before reporting an issue, please make sure the bug has not already been reported under the repository's **Issues** section.

When submitting a bug report, please include the following information:

* Your **operating system** and version.
* Your **browser** and version.
* Steps to reproduce the issue.
* A short description of the expected behavior and what actually happened.
* Relevant error messages or console logs.
* Screenshots or screen recordings, if applicable.
* Any other information that may help reproduce or understand the issue.

Please **do not include API keys, passwords, authentication tokens, or other sensitive information** in an issue.

### Do you want a new feature?

If there is a new feature you'd like to see in **PantryPal - Recipe**, please open an issue and describe:

1. **Motivation**
   Explain the problem, limitation, or use case that the feature would address.

2. **Feature Description**
   Describe the proposed feature and how you would expect it to work.

3. **User Experience**
   Explain how the feature would improve the experience for PantryPal users.

4. **Implementation Details**
   If you have an implementation idea, architecture suggestion, or code example, feel free to include it.

5. **Additional References**
   If the feature is inspired by an external project, article, design, or technical reference, please include the relevant link.

A clear and well-written feature request makes it much easier to evaluate and discuss the proposal.

## Do you want to add documentation?

We're always looking for improvements to the documentation that make **PantryPal - Recipe** clearer and easier to understand.

You can contribute by:

* Fixing typos or grammatical errors.
* Improving setup instructions.
* Adding missing documentation.
* Clarifying confusing sections.
* Adding examples.
* Improving API or development documentation.

Documentation contributions are highly appreciated, especially when they make it easier for new contributors to get started.

## Fixing outstanding issues

If you notice an existing issue and have a fix in mind, feel free to **[start contributing](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)** and open a Pull Request.

### Making code changes

<details>

1. **Fork the Repository**

   Go to the PantryPal - Recipe repository on GitHub and click the **Fork** button.

2. **Clone your forked repository**

   ```bash
   git clone https://github.com/<username>/PantryPal-Recipe.git
   ```

   Navigate into the project directory:

   ```bash
   cd PantryPal-Recipe
   ```

3. **Create a New Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Install Dependencies**

   Make sure Node.js is installed, then install the project dependencies:

   ```bash
   npm install
   ```

5. **Configure Environment Variables**

   Create a `.env` file based on the provided `.env.example` file and add the required environment variables.

   **Never commit API keys, Firebase credentials, or other secrets to the repository.**

6. **Run the Application Locally**

   ```bash
   npm run dev
   ```

7. **Make Your Changes**

   * Develop the feature or fix the issue.
   * Follow the existing project structure and coding conventions.
   * Keep changes focused and maintainable.
   * Test your changes locally before submitting a Pull Request.

8. **Run the Available Checks**

   ```bash
   npm run lint
   ```

   If applicable, also run the project's test suite:

   ```bash
   npm test
   ```

9. **Commit Your Changes**

   ```bash
   git add .
   git commit -m "Add feature/bugfix description"
   ```

10. **Push to Your Fork**

```bash
git push origin feature/your-feature-name
```

11. **Create a Pull Request**

Go to the original PantryPal - Recipe repository and open a **New Pull Request**.

In your Pull Request description:

* Explain what you changed.
* Explain why the change was needed.
* Mention any relevant issue.
* Include screenshots for UI changes when appropriate.
* Mention any testing you performed.

12. **Address Feedback**

If maintainers leave comments or request changes, address the feedback and push the required updates to your branch.

</details>

## Contribution Guidelines

To keep the project maintainable and welcoming:

* Keep Pull Requests focused on a single feature, fix, or improvement whenever possible.
* Avoid unnecessary changes to unrelated files.
* Follow the existing coding style and project structure.
* Test changes before submitting a Pull Request.
* Do not commit secrets, API keys, credentials, or `.env` files containing sensitive information.
* Provide clear commit messages and Pull Request descriptions.
* Be respectful and constructive when reviewing or discussing contributions.

## I want to become a maintainer of the project. How do I get there?

**PantryPal - Recipe** is a recipe discovery and ingredient-matching web application designed to help users discover recipes based on the ingredients they have available.

Contributors interested in improving recipe discovery, ingredient matching, authentication, pantry management, favorites, meal planning, API integration, UI/UX, performance, testing, security, and documentation are always welcome.

We are happy to welcome motivated contributors who want to take a deeper role in the project and help **PantryPal - Recipe** evolve into a reliable, user-friendly, and maintainable application.

If you are interested in contributing at a deeper level, consistently submitting meaningful improvements, reviewing Pull Requests, improving documentation, or helping maintain the project, feel free to get involved and collaborate with the community.

Thank you for contributing to **PantryPal - Recipe**! 
