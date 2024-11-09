# MINI_UIUC XX FEYNMAN

### Overview

MINI UIUC is an educational assistant web application aimed at enhancing learning experiences for students by using feynman's process. The app features built-in virtual teachers who help students learn different concepts using interactive conversations. By integrating technologies such as LlamaIndex and the NVIDIA NIMs, this project combines AI and vector databases to create a personalized learning journey for each student. The app is presented through an Electron-based front end and a Flask back end.

### Features

- **Agent Interaction**: Built-in virtual agents (e.g., Dean and Feynman) act as teachers to assist students in understanding concepts through conversation.
- **Knowledge Tracking**: Uses a vector database to track the student's learning progress, dynamically adapting the conversation based on previous interactions.
- **Interactive Questioning**: The agents employ the "Feryman's method," which challenges students by asking questions, guiding them to reflect on their learning process.
- **Material Upload**: Users can upload videos, PDFs, or notes, which agents can use for contextual referencing.

### Technologies Used

- **NVIDIA NIMs**: Provides the natural language generation capabilities, allowing agents to respond in meaningful and pedagogical ways.
- **Electron**: Cross-platform front-end framework that wraps the web application into a desktop experience.
- **Flask**: Back-end API for handling requests between the Electron front end and the server.

### Project Structure

- **Frontend**: Electron is used as the front-end, providing the UI for interaction. The user interface includes different sections such as agents, text content area, file upload, and user input area.
- **Backend**: Flask API for processing requests, managing uploads, and interacting with the learning agents. It handles the logic for fetching concepts, reviewing user inputs, and updating learning stages.
- **Agents**: The system uses multiple agent types, each fulfilling distinct roles:

  - **Guard Agent**: Ensures that the current discussion remains within the learning scope.
  - **Feynman Agent**: Reviews questions that should be asked to deepen understanding.
  - **Local Agent**: Queries Wikipedia and local data for relevant information.
  - **Direct LLM Agent**: Queries an LLM directly for responses.
  - **Merge Agent**: Combines the results from the local and direct LLM agents.
  - **Dean Agent**: Helps in administrative and learning tasks. Assists in book reading, video watching, and concept study.
  - **Feynman Agent**: Adopts Feynman's method for deeper understanding through reflection and simplified explanations.

  ![Graph](/images/structure.png "Our Company Logo")

### Installation

0.  **Get the API KEY and append to your bash**  
    Create an account and get the API KEY:
    https://build.nvidia.com/explore/discover  
    be sure to check your

    ```bash
    nano ~/.zshrc
    ```

        Scroll to the end of the file and add the following line:
        ``` bash
        export NVIDIA_API_KEY="your_api_key_here"
        ```
        press CTRL + X, then Y to confirm, and Enter to save.

    ```bash
    source ~/.zshrc
    ```

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-repo/mini-uiuc.git
    cd mini-uiuc
    ```
2.  **Install Dependencies**
    - **Create Python Environment**
      ```bash
      conda create -n miniuiucxxfeynman python=3.10
      conda activate miniuiucxxfeynman
      ```
    - **Backend (Flask, PyTorch, and Dependencies)**
      ```bash
      pip install Flask
      conda install pytorch torchvision torchaudio -c pytorch
      pip install llama-index autogen-agentchat==0.4.0.dev2 --upgrade --quiet llama-index-llms-nvidia llama-index-embeddings-nvidia llama-index-readers-file
      ```
    - **Frontend (Electron)**
      ```bash
      nvm use 20
      npm init
      npm install --save-dev electron
      npm install dotenv
      ```
    - **Set Entry Point**
      Ensure the entry point in `package.json` is set to `main.js` instead of the default `index.js`.
3.  **Run the local index server manager**
    ```bash
    python index_server.py
    ```
4.  **Run the Backend Server**
    ```bash
    python app.py
    ```
5.  **Run the Frontend**
    ```bash
    npm start
    ```

### Usage

- **Launching the App**: After starting both the front end and the back end, the application will open in an Electron window.
- **Interaction**: Click on the different agents to start a learning session. The "Dean" helps with learning concepts, while "Feynman" helps reflect on what you've learned.
- **File Upload**: Upload related materials for deeper learning, such as documents, which agents will reference during conversations.

### Development

- **Notes Review**: The `notes.json` file is used to track the learning stage of concepts. The application dynamically updates the learning stage based on user interactions. You can always to click the notes to check your progess.

### Contributing

1. **Fork the Project**
2. **Create Your Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit Your Changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

### Future Improvements

- **Video**
  - Should support uploading a video of lecture, then track the user's behavior when watching, show help infomation when user clicked pause
  - Should support replay the video when user review the concept
- **Calibration** More calibration about current agents, espacially about concept extraction
- support more APIs like ChatGPT.
- **Additional Agents**: Adding more agents for specialized subjects like Math, Science, or History.
- **Improved Learning Tracking**: Integration with more advanced models to track and predict student knowledge gaps.
- **Multimedia Learning**: Enhanced multimedia learning experiences, including interactive quizzes and real-time feedback.

### License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

### Acknowledgments

- Inspired by the teaching methods of Richard Feynman and personalized education.
- Thanks to the developers and community behind LlamaIndex,Wikipedia, LlamaIndex
  and NVIDIA NIMs for their amazing tools and APIs.

---

Enjoy learning with MINI UIUC! Feel free to reach out for contributions or suggestions.
