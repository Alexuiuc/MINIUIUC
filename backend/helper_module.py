import requests
from openai import OpenAI
import os
import json
import re
from datetime import datetime
import nest_asyncio

nest_asyncio.apply()

from llama_index.llms.nvidia import NVIDIA
from llama_index.core.llms import ChatMessage, MessageRole

llm = NVIDIA()


def guard(prompt,previousTopic):
    messages = [
        ChatMessage(
            role=MessageRole.SYSTEM, content=("You are a guard to check if user talked the same concept as {previousTopic} ")
        ),
        ChatMessage(
            role=MessageRole.USER,
            content=(f"reply in less than 3 words, what is the concept the user talked about by saying this: {prompt}? ")
        ),
    ]
    responses = llm.chat(messages)
    text=str(responses)
 
    if text:
        return text[10:]
    else:
        return prompt


def get_wikipedia_definition(concept):
    url = f"https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&titles={concept}&format=json&redirects=1&origin=*"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        pages = data.get("query", {}).get("pages", {})
        for page_id, page in pages.items():
            if page_id != "-1":
                return page.get("extract", "")
        return ""
    except requests.RequestException as e:
        print(f"Error fetching definition: {str(e)}")
        return ""
    
def update_notes(concept):

    notes_path = 'Notes/notes.json'
    current_time = datetime.now().strftime("%Y-%m-%d %I:%M %p")

    # Load existing notes if the file exists
    notes = []
    if os.path.exists(notes_path):
        with open(notes_path, 'r') as file:
            try:
                notes = json.load(file)
            except json.JSONDecodeError:
                print("Error decoding JSON, starting with an empty list.")
                notes = []

    # Check if the concept already exists in notes
    updated = False
    for note in notes:
        if note["term"] == concept:
            note["review_time"] = current_time  # Update the review time if the concept already exists
            updated = True
            break

    # If the concept is new, add it to the list
    if not updated:
        notes.append({"term": concept, "stage": "Learning", "review_time": current_time})

    # Write updated notes back to the file
    with open(notes_path, 'w') as file:
        json.dump(notes, file, indent=2)  

def process_user_input(user_input_text,agentTalkedTo,previousTopic,previousMessage, manager):
    # Process the user input and generate an appropriate response
    if agentTalkedTo=='Dean':
        concept = guard(user_input_text,previousTopic)
        if concept == previousTopic:
            previousMessage.append(user_input_text)
            message = "".join(previousMessage)
            messages = [
                ChatMessage(
                    role=MessageRole.SYSTEM, content=("You are a assitant to help people to learn the concept: {concept} ")
                ),
                ChatMessage(
                    role=MessageRole.USER,

                    content=message
                ),
            ]
            return str(llm.chat(messages))[10:], concept

        else:
            wiki = get_wikipedia_definition(concept)
            print("from wiki:",wiki)
            localText = manager.query_index(concept)
            print("from localText:",localText)
            
            messages = [
                ChatMessage(
                    role=MessageRole.SYSTEM, content=(f"You are a assistant to help people to learn the concept: {concept} ")
                ),
                ChatMessage(
                    role=MessageRole.USER,
                    content=(f"based on {wiki} and {localText}, help user to answer this: " +  user_input_text)
                ),
            ]
            return str(llm.chat(messages))[10:], concept            
    elif agentTalkedTo=='Feynman':
        
        pass
    else:
        return "unknow agent","unknown"




    
    # return {
    #     "agentname": "Dean",
    #     "reply": "I am the Dean of this mini UIUC, feel free to ask me any admin-related questions!"
    # }