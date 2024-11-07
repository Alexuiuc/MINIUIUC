# MINIUIUC

UIUC course project for CS410

# Install

pip install llama-index
conda create -n autogen python=3.10
conda activate autogen
pip install autogen-agentchat==0.4.0.dev2
nvm use 20
npm init
npm install --save-dev electron
npm install dotenv
`remember to to set the entry point as main.js` not `index.js`
pip install Flask
conda install pytorch torchvision torchaudio -c pytorch
pip install --upgrade --quiet llama-index-llms-nvidia llama-index-embeddings-nvidia llama-index-readers-file

# TODOs

- Notes: should pop a window when clicked and indicate the stage of learned concept
- Agents Structure:
  - Type:
    - **Guard agent**: Is current discussion out of scope?
    - **Feynman agent**:Review questions should ask
    - **local agent**: query Wikipedia + local data
    - **Direct LLM agent**: query LLM
    - **Merge Agent**: Merge result from local and direct
  - Graph:
    ![Graph](/images/structure.png "Our Company Logo")
