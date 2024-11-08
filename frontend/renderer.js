// JavaScript Code

document.addEventListener('DOMContentLoaded', () => {
    const agentsContainer = document.getElementById('agentsContainer');
    const teacherImage = document.getElementById('teacherImage');
    const textContent = document.getElementById('textContent');
    const userInput = document.getElementById('userTextArea');
    const enterButton = document.getElementById('enterButton');
    const uploadButton = document.getElementById('uploadButton');
    const uploadStatus = document.getElementById('upload-status');

    // Function to escape HTML to prevent XSS attacks
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // Function to add a new agent
    function addAgent(agentData) {
        const imgSection = document.createElement('div');
        imgSection.className = 'img-section';
        imgSection.innerHTML = `
            <div class="img-circle"><img src="${escapeHTML(agentData.image)}" alt="Agent Image" style="width:100%; height:100%; object-fit: cover;"></div>
            <div class="img-text">${escapeHTML(agentData.name)}</div>
        `;
        
        // Click event to update teacher image and content
        imgSection.addEventListener('click', () => {
            teacherImage.innerHTML = `<img src="${escapeHTML(agentData.image)}" alt="Agent Image" style="width:100%; height:100%; object-fit: cover;">`;
            const agentMessageDiv = document.createElement('div');
            agentMessageDiv.className = 'agent-message';
            agentMessageDiv.innerHTML = `<strong>Agent (${escapeHTML(agentData.name)}):</strong> ${agentData.description}`;
            agentMessageDiv.style.backgroundColor = '#f3e5f5'; // Light purple background for agent
            agentMessageDiv.style.padding = '10px';
            agentMessageDiv.style.borderRadius = '10px';
            agentMessageDiv.style.margin = '10px 0';
            textContent.appendChild(agentMessageDiv);
            textContent.scrollTop = textContent.scrollHeight; // Scroll to the bottom
        });


        agentsContainer.appendChild(imgSection);
    }

    // Function to remove an agent
    function removeAgent(agentName) {
        const agentElements = agentsContainer.getElementsByClassName('img-section');
        for (let i = 0; i < agentElements.length; i++) {
            const imgText = agentElements[i].querySelector('.img-text');
            if (imgText && imgText.innerText === agentName) {
                agentsContainer.removeChild(agentElements[i]);
                break;
            }
        }
    }

    // Function to fetch and update agents from API
    async function updateAgentsFromAPI(apiUrl) {
        try {
            const response = await fetch(apiUrl);
            const agents = await response.json();
            agentsContainer.innerHTML = ''; // Clear existing agents
            agents.forEach(agent => {
                addAgent(agent);
            });
        } catch (error) {
            console.error('Error fetching agents:', error);
        }
    }

    // Function to send user input to an API
    async function sendUserInputToAPI(inputText) {
        const apiUrl = window.env.API_URL; // Use the API_URL from the environment variables
        try {
            const escapedInputText = escapeHTML(inputText);
            const response = await fetch(`${apiUrl}/user-input`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userInput: escapedInputText })
            });
            const result = await response.json();
            console.log('Response from API:', result);

            // Append the agent's reply to the textContent area
            if (result.agentname && result.reply) {
                const agentMessageDiv = document.createElement('div');
                agentMessageDiv.className = 'agent-message';
                agentMessageDiv.innerHTML = `<strong>Agent (${escapeHTML(result.agentname)}):</strong> ${escapeHTML(result.reply)}`;
                agentMessageDiv.style.backgroundColor = '#f3e5f5'; // Light purple background for agent
                agentMessageDiv.style.padding = '10px';
                agentMessageDiv.style.borderRadius = '10px';
                agentMessageDiv.style.margin = '10px 0';
                textContent.appendChild(agentMessageDiv);
                textContent.scrollTop = textContent.scrollHeight; // Scroll to the bottom
            }
        } catch (error) {
            console.error('Error sending user input:', error);
        }
    }
        // Function to handle file upload
        async function handleFileUpload(file) {
            const apiUrl = window.env.API_URL; // Use the API_URL from the environment variables
            console.log(apiUrl)
            const formData = new FormData();
            formData.append('file', file);
            //console.log(formData)
    
            try {
                const response = await fetch(`${apiUrl}/uploadFile`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                console.log('File upload response:', result);
            } catch (error) {
                console.error('Error uploading file:', error);

            }
        }
    
        // Event listener for the upload button
        uploadButton.addEventListener('click', () => {
            if (fileInput.files.length > 0) {
                handleFileUpload(fileInput.files[0]);
            } else {
                console.log("upload fail");
            }
        });
    

    // Function to handle user input submission
    function handleUserInputSubmission() {
        const inputText = userInput.value;
        if (inputText) {
            // Send the user input to the API
            sendUserInputToAPI(inputText);
            
            // Append the user input to the textContent area
            const userMessageDiv = document.createElement('div');
            userMessageDiv.className = 'user-message';
            userMessageDiv.innerHTML = `<strong>User:</strong> ${escapeHTML(inputText)}`;
            userMessageDiv.style.backgroundColor = '#e0f7fa'; // Light blue background for user
            userMessageDiv.style.padding = '10px';
            userMessageDiv.style.borderRadius = '10px';
            userMessageDiv.style.margin = '10px 0';
            textContent.appendChild(userMessageDiv);
            textContent.scrollTop = textContent.scrollHeight; // Scroll to the bottom

            // Clear the user input field
            userInput.value = '';
        }
    }


    // Event listener for the enter button
    enterButton.addEventListener('click', handleUserInputSubmission);

    // Event listener for keypress in the user input field
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            if (event.shiftKey) {
                // Allow Shift + Enter to create a new line
                userInput.value += '\n';
            } else {
                // Prevent default behavior of Enter key
                event.preventDefault();
                handleUserInputSubmission();
            }
        }
    });

    // Example usage of adding agents dynamically
    window.addAgent = addAgent;
    window.removeAgent = removeAgent;
    window.updateAgentsFromAPI = updateAgentsFromAPI;

    // Example: Add initial agents (replace these with real data)
    addAgent({ name: 'Dean', image: './images/Dean.webp', description: 'I am the Dean of this mini UIUC, here is what you can do by using this miniapp:<br> 1 read a book together<br> 2 learn a video lecture together<br> 3 study a concept\n' });
    addAgent({ name: 'Feynman', image: './images/Feynman.webp', description: 'I am the helper to help people use Feyrnman\'s process' });

    // Example: Fetch agents from an API (uncomment and replace URL)
    // updateAgentsFromAPI('https://example.com/api/agents');
    teacherImage.innerHTML = `<img src="./images/Dean.webp" alt="Agent Image" style="width:100%; height:100%; object-fit: cover;">`;
    const initialMessageDiv = document.createElement('div');
    initialMessageDiv.className = 'agent-message';
    initialMessageDiv.innerHTML = `<strong>Agent (Dean):</strong> I am the Dean of this mini UIUC, here is what you can do by using this miniapp:<br> 1 read a book together<br> 2 learn a video lecture together<br> 3 study a concept\n`;
    initialMessageDiv.style.backgroundColor = '#f3e5f5'; // Light purple background for agent
    initialMessageDiv.style.padding = '10px';
    initialMessageDiv.style.borderRadius = '10px';
    initialMessageDiv.style.margin = '10px 0';
    textContent.appendChild(initialMessageDiv);
    textContent.scrollTop = textContent.scrollHeight; // Scroll to the bottom
});