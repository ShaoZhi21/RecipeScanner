# AI-Powered Smart Recipe Creator

This project is a web application that allows users to upload images of food, recognize ingredients using OpenAI API, and generate recipes. Users can save their favorite recipes and search for recipes using the search function. This project was done by group Source Masters for HackoMania 2025 by GeeksHacking.

## Features

- **Image Upload**: Upload images to an Amazon S3 bucket.
- **Image Recognition**: Use OpenAI API to recognize food items in the uploaded images.
- **Ingredient Selection**: Select ingredients from the recognized items and add manually.
- **Recipe Generation**: Generate recipes based on selected ingredients.
- **Save Recipes**: Save generated recipes to your personal list.
- **Search Recipes**: Search for recipes using the search function.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/ShaoZhi21/RecipeScanner.git
    ```
2. Navigate to the project directory:
    ```bash
    cd recipe
    ```
3. Install dependencies:
    ```bash
    npm install
    ```

## Usage

1. Start the development server:
    ```bash
    npm start
    ```
2. Open your browser and navigate to `http://localhost:3000`.

3. Navigate into backend folder and start the backend:
    ```bash
    node server.js
    ```

## Configuration

- **Amazon S3**: Configure your S3 bucket details in the `.env` file.
- **OpenAI API**: Add your OpenAI API key to the `.env` file.

## Contributers

Soong Shao Zhi, Meng Shuo, Lee Chong Rui, Teo Ze Xuan


