# 🌴 One-of-a-kind Travel Itinerary 🛫

## Overview 
This project is part of the Travel Associates website redesign and rebuild effort. Within the Innovation stream, we are exploring the use of Generative AI to create personalized travel itineraries. By leveraging Large Language Models (LLMs), we aim to generate travel itineraries from Travel Associates (TA) and Flight Centre Travel Group (FCTG)'s extensive travel information knowledge base, tailored to customers’ preferences identified through social media interactions.

These concepts not only aim to meet customer expectations but also to differentiate Travel Associates in a competitive landscape. This foundational work will enable us to integrate more advanced features in the future, including rich media content and video, to enhance user experience and engagement further.

As the technology matures, it will be equipped to deliver even more personalized and immersive travel experiences, allowing Travel Associates to continually adapt to evolving market trends and traveler preferences. This project is designed to be developed independently of TA's traditional digital presence, allowing for greater flexibility in experimentation and validation, thereby reducing risks to TA's established image.

### Scope
- **Brand**: Travel Associates only
- **Type**: MVP build
- **Application**: Standalone single-page application
- **Functionality**: Generate travel itineraries using LLMs, provide suggested itineraries to inspire users, and send inquiries to CRM
- **Data Sources**:
  - TA’s travel magazines in PDF format
  - Spreadsheet with packages offered by LTC
  - Spreadsheet with packages data extracted from TA’s Drupal CMS

### Out of Scope
- Detailed information about pricing, accommodation availability, flights, or anything beyond images and descriptions of locations and activities.

## 👉 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

#### Node.js Component
Ensure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).

#### Python Component
Ensure you have Python installed. You can download it from [python.org](https://www.python.org/).

### Installation

#### Node.js Component

1. Clone the repository:
    ```bash
    git clone https://github.com/darren-mars/fcta-chatbot.git
    cd fcta-chatbot
    ```

2. Install the Node.js dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

3. Create a `.env.local` file in the root of your project and add the following environment variables:
    ```plaintext
    WORKSPACE_URL=https://adb-19070432379385.5.azuredatabricks.net
    NEXT_PUBLIC_DATABRICKS_TOKEN=YOUR_DATABRICKS_TOKEN_HERE
    NEXT_PUBLIC_BASE_PROMPT=./src/app/chat/systemPrompt.txt
    ```

4. Run the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun run dev
    ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the UI.

#### Python Component - Data

1. Navigate to the Python directory:
    ```bash
    cd data
    ```

2. Set up the virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. Install the Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```

### Development

#### Running Tests

To run tests for the Python component, use `pytest`:
```bash
cd data/tests
pytest
```

#### Linting and Formatting

To check the code with `flake8` and format it with `black`:
```bash
flake8
black .
```

### Project Structure

The directory structure of the project includes:

- **Node.js Component**: Handles the UI and API parts of the application.
- **Python Component**: Focuses on data handling, including notebooks, source files, and tests.

### More Context

#### Virtual Environments
We use virtual environments to manage dependencies for the Python component. This ensures that each project has its own dependencies, regardless of what dependencies every other project has.

#### Testing with Pytest
Pytest is used for running unit tests. It is a powerful testing framework that makes it easy to write simple and scalable test cases.

#### Linting with Flake8 and Black
- **Flake8**: A tool that checks the style guide enforcement, programming errors, and complexity.
- **Black**: A code formatter that ensures consistent formatting.

### Additional Information

If you need more context or encounter any issues, feel free to reach out or check the project's issue tracker.

#### Contact
- **Maintainers**: CI&T - Darren Mariadas and Paulo Barbosa
- **Email**: darren.mariadas@ciandt.com | paulo.barbosa@ciandt.com
- **GitHub**: [darren-mars](https://github.com/darren-mars) | [paulobarbosa-ciandt](https://github.com/paulobarbosa-ciandt)

### Contributing

If you would like to contribute to this project, please follow the standard contributing guidelines:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/fooBar`).
3. Commit your changes (`git commit -am 'Add some fooBar'`).
4. Push to the branch (`git push origin feature/fooBar`).
5. Create a new Pull Request.