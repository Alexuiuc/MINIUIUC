// JavaScript Code

document.addEventListener('DOMContentLoaded', () => {
    const agentsContainer = document.getElementById('agentsContainer');
    const teacherImage = document.getElementById('teacherImage');
    const textContent = document.getElementById('textContent');
    const userInput = document.getElementById('userTextArea');
    const enterButton = document.getElementById('enterButton');
    const uploadButton = document.getElementById('uploadButton');
    const uploadStatus = document.getElementById('upload-status');
    const notesButton = document.getElementById('notesButton');
    let currentAgent = null;

    // Function to escape HTML to prevent XSS attacks
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
    // Function to fetch and display concepts to review
    async function fetchAndDisplayConcepts() {
        try {
            const apiUrl = window.env.API_URL; // Use the API_URL from the environment variables
            const response = await fetch(`${apiUrl}/notes`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch notes');
            }

            const notes = await response.json();
            let conceptsToReview = "<ul>";
            let conceptsToTeach = "<ul>";
            notes.forEach(note => {
                if (note.stage.toLowerCase() === 'review') {
                    conceptsToReview += `<li>${note.term} (Review Time: ${note.review_time})</li>`;
                }else if(note.stage.toLowerCase() === 'teaching'){
                    conceptsToTeach += `<li>${note.term} (Learning Time: ${note.review_time})</li>`;
                }
            });
            conceptsToReview += "</ul>";
            conceptsToTeach += "</ul>";
            // Display concepts to be reviewed in the textContent area
            const teachMessageDiv = document.createElement('div');
            teachMessageDiv.className = 'teach-message';
            teachMessageDiv.innerHTML = `<strong>Concepts to Teach:</strong> ${conceptsToTeach}`;
            teachMessageDiv.style.backgroundColor = '#1ff3cd'; // Light yellow background for reviews
            teachMessageDiv.style.padding = '1vw';
            teachMessageDiv.style.borderRadius = '1vw';
            teachMessageDiv.style.margin = '1vw 0';
            textContent.appendChild(teachMessageDiv);
            textContent.scrollTop = textContent.scrollHeight; // Scroll to the bottom

            // Display concepts to be reviewed in the textContent area
            const reviewMessageDiv = document.createElement('div');
            reviewMessageDiv.className = 'review-message';
            reviewMessageDiv.innerHTML = `<strong>Concepts to Review:</strong> ${conceptsToReview}`;
            reviewMessageDiv.style.backgroundColor = '#fff3cd'; // Light yellow background for reviews
            reviewMessageDiv.style.padding = '1vw';
            reviewMessageDiv.style.borderRadius = '1vw';
            reviewMessageDiv.style.margin = '1vw 0';
            textContent.appendChild(reviewMessageDiv);
            textContent.scrollTop = textContent.scrollHeight; // Scroll to the bottom


        } catch (error) {
            console.error('Error fetching notes:', error);
            alert('Unable to fetch notes. Please try again later.');
        }
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
            currentAgent = agentData.name; 
            teacherImage.innerHTML = `<img src="${escapeHTML(agentData.image)}" alt="Agent Image" style="width:100%; height:100%; object-fit: cover;">`;
            const agentMessageDiv = document.createElement('div');
            agentMessageDiv.className = 'agent-message';
            agentMessageDiv.innerHTML = `<strong>Agent (${escapeHTML(agentData.name)}):</strong> ${agentData.description}`;
            agentMessageDiv.style.backgroundColor = '#f3e5f5'; // Light purple background for agent
            agentMessageDiv.style.padding = '1vw';
            agentMessageDiv.style.borderRadius = '1vw';
            agentMessageDiv.style.margin = '1vw 0';
            textContent.appendChild(agentMessageDiv);
            textContent.scrollTop = textContent.scrollHeight; // Scroll to the bottom
            // If agent is Feynman, fetch the notes and display concepts to be reviewed
            if (agentData.name.toLowerCase() === 'feynman') {
                fetchAndDisplayConcepts()
            }
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
    function replaceAgent(agentName,description){
        teacherImage.innerHTML = `<img src="./images/${agentName}.webp" alt="Agent Image" style="width:100%; height:100%; object-fit: cover;">`;
        const initialMessageDiv = document.createElement('div');
        initialMessageDiv.className = 'agent-message';
        initialMessageDiv.innerHTML = `<strong>Agent (${agentName}):</strong> ${description}`;
        initialMessageDiv.style.backgroundColor = '#f3e5f5'; // Light purple background for agent
        initialMessageDiv.style.padding = '10px';
        initialMessageDiv.style.borderRadius = '10px';
        initialMessageDiv.style.margin = '10px 0';
        textContent.appendChild(initialMessageDiv);
        textContent.scrollTop = textContent.scrollHeight; // Scroll to the bottom
        currentAgent = agentName
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
    async function sendUserInputToAPI(inputText, currentAgent, previousMessages) {
        const apiUrl = window.env.API_URL; // Use the API_URL from the environment variables
        try {
            const data = {
                userInput: escapeHTML(inputText),
                agent: currentAgent,
                previousMessages: previousMessages
            };
            const response = await fetch(`${apiUrl}/user-input`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            console.log('Response from API:', result);

            // Append the agent's reply to the textContent area
            if (result.agentname && result.reply) {
                const agentMessageDiv = document.createElement('div');
                agentMessageDiv.className = 'agent-message';
                agentMessageDiv.innerHTML = `<strong>Agent (${result.agentname}):</strong> ${result.reply}`;
                agentMessageDiv.style.backgroundColor = '#f3e5f5'; // Light purple background for agent
                agentMessageDiv.style.padding = '1vw';
                agentMessageDiv.style.borderRadius = '1vw';
                agentMessageDiv.style.margin = '1vw 0';
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
        //console.log(apiUrl)
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

    

    notesButton.addEventListener('click', async () => {
        const apiUrl = window.env.API_URL; // Use the API_URL from the environment variables
        const notesUrl = `${apiUrl}/notes`;

        try {
            // Fetch the notes content from the server
            const response = await fetch(notesUrl, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch notes');
            }

            // Parse the response JSON
            const notes = await response.json();

            // Create HTML content to display the notes
            let htmlContent = `
                <html>
                <head>
                    <title>Notes</title>
                    <style>
                        table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        table, th, td {
                            border: 1px solid black;
                        }
                        th, td {
                            padding: 10px;
                            text-align: left;
                        }
                        th {
                            background-color: #f2f2f2;
                        }
                    </style>
                </head>
                <body>
                    <h1>Notes</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>Term</th>
                                <th>Stage</th>
                                <th>Review Time</th>
                            </tr>
                        </thead>
                        <tbody>`;

            notes.forEach(note => {
                htmlContent += `
                    <tr>
                        <td>${note.term}</td>
                        <td>${note.stage}</td>
                        <td>${note.review_time}</td>
                    </tr>`;
            });

            htmlContent += `
                        </tbody>
                    </table>
                </body>
                </html>`;

            // Open a new window and write the HTML content
            const notesWindow = window.open("", "_blank", "width=800,height=600");
            notesWindow.document.write(htmlContent);
            notesWindow.document.close();
        } catch (error) {
            console.error('Error fetching notes:', error);
            alert('Unable to fetch notes. Please try again later.');
        }
    });

    // Function to handle user input submission
    function handleUserInputSubmission() {
        const inputText = userInput.value;
        if (inputText) {
            // Gather all previous messages in the text area
            const messages = textContent.querySelectorAll('div');
            let previousMessages = [];
            messages.forEach(message => {
                previousMessages.push(message.innerText);
            });

            // Send the user input to the API along with current agent and previous messages
            sendUserInputToAPI(inputText, currentAgent, previousMessages);
            
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
    dean_description="I am the Dean of this mini UIUC. Here are some things you can do with this app:<br> 1. Learn a concept together.<br> 2. Upload related materials to the app for me to reference."
    feynMan_description = "I am here to help you use Feynman's method.<br> The key idea is to explain what you've learned as if you were teaching it to a child."
    // Example: Add initial agents (replace these with real data)
    addAgent({ name: 'Dean', image: './images/Dean.webp', description: dean_description });
    addAgent({ name: 'Feynman', image: './images/Feynman.webp', description: feynMan_description });

    // Example: Fetch agents from an API (uncomment and replace URL)
    // updateAgentsFromAPI('https://example.com/api/agents');
   
    replaceAgent("Dean",dean_description)
});