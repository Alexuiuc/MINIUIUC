document.addEventListener('DOMContentLoaded', () => {
    const agentsContainer = document.getElementById('agentsContainer');
    const teacherImage = document.getElementById('teacherImage');
    const textContent = document.getElementById('textContent');

    // Function to add a new agent
    function addAgent(agentData) {
        const imgSection = document.createElement('div');
        imgSection.className = 'img-section';
        imgSection.innerHTML = `
            <div class="img-circle"><img src="${agentData.image}" alt="Agent Image" style="width:100%; height:100%; object-fit: cover;"></div>
            <div class="img-text">${agentData.name}</div>
        `;
        
        // Click event to update teacher image and content
        imgSection.addEventListener('click', () => {
            teacherImage.innerHTML = `<img src="${agentData.image}" alt="Agent Image" style="width:100%; height:100%; object-fit: cover;">`;
            textContent.innerHTML = `<div>${agentData.description}</div>`;
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

    // Example usage of adding agents dynamically
    window.addAgent = addAgent;
    window.removeAgent = removeAgent;
    window.updateAgentsFromAPI = updateAgentsFromAPI;

    // Example: Add initial agents (replace these with real data)
    addAgent({ name: 'Dean', image: './images/Dean.webp', description: 'Dean' });
    addAgent({ name: 'Feynman', image: './images/Feynman.webp', description: 'Feynman' });

    // Example: Fetch agents from an API (uncomment and replace URL)
    // updateAgentsFromAPI('https://example.com/api/agents');
});
