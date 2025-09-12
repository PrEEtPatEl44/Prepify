# Contributing to Prepify

Thank you for your interest in contributing to Prepify! This document provides guidelines and instructions for contributors.

## Table of Contents


- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)





## Getting Started

1. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Group_6_Prepify_PRJ666.git`
2. Add the upstream repository: `git remote add upstream https://github.com/PrEEtPatEl44/Group_6_Prepify_PRJ666.git`
3. Create a new branch for your feature or bug fix: `git checkout -b your-feature-name`

## Development Environment Setup

1. Make sure you have Node.js (version 18 or later) installed
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

1. Create a new branch from the `main` branch
2. Make your changes and test them locally
3. Commit your changes with clear commit messages
4. Push your branch to your fork
5. Create a pull request to the `main` branch of the original repository

## Pull Request Process

1. Ensure your code follows the project's coding standards
2. Compoulsary review will be done by the codeowner
3. Once approved, your PR will be merged

## Coding Standards

- Follow the TypeScript and React best practices
- Use the existing code style and formatting
- Write clear, readable, and maintainable code
- Add comments for complex logic
- Use meaningful variable and function names

## Commit Message Guidelines

Follow the conventional commits specification:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

Example: `feat: add user authentication component`

