import requests
from openai import OpenAI
import os
import json
from datetime import datetime
import nest_asyncio

nest_asyncio.apply()

from llama_index.llms.nvidia import NVIDIA
from llama_index.core.llms import ChatMessage, MessageRole

llm = NVIDIA()


def guard(prompt):
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
    
def update_notes(concept,stage):

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
            note["stage"] = stage
            updated = True
            break

    # If the concept is new, add it to the list
    if not updated:
        notes.append({"term": concept, "stage": "Teaching", "review_time": current_time})

    # Write updated notes back to the file
    with open(notes_path, 'w') as file:
        json.dump(notes, file, indent=2)  

def continue_talk(previousMessage,user_input_text):
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
        return str(llm.chat(messages))[10:]

def start_new_topic(user_input_text,concept,manager):
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
        return str(llm.chat(messages))[10:]

def process_user_input(user_input_text,agentTalkedTo,previousTopic,previousMessage, manager):
    # Process the user input and generate an appropriate response
    if agentTalkedTo=='Dean':
        concept = guard(user_input_text)
        if concept == previousTopic:
            
            return continue_talk(previousMessage,user_input_text), concept, 
        else:
            update_notes(concept,"Learning")
            return start_new_topic(user_input_text,concept,manager), concept,
               
    elif agentTalkedTo == 'Feynman':
        # Step 1: Check the concept user talked about
        talkedConcept = guard(user_input_text)

        # Step 2: Check note stage by extracting the concept stage from notes.json
        concept_stage = None
        notes_path = 'Notes/notes.json'

        # Load the notes and find the concept's stage
        if os.path.exists(notes_path):
            with open(notes_path, 'r') as file:
                try:
                    notes = json.load(file)
                    for note in notes:
                        if note["term"].lower() == talkedConcept.lower():
                            concept_stage = note["stage"]  # Could be 'Teaching' or 'Review'
                            break
                except json.JSONDecodeError:
                    print("Error decoding JSON from notes file")


        # If the concept does not exist in notes.json
        if concept_stage is None:
            update_notes(talkedConcept,"Learning")
            return start_new_topic(user_input_text, talkedConcept, manager), talkedConcept

        # Step 3: If the stage is 'Teaching'
        if concept_stage.lower() == 'teaching':
            # Create prompt to check if the user input is correct
            messages = [
                ChatMessage(
                    role=MessageRole.SYSTEM,
                    content=f"You are an assistant to help people learn the concept: {talkedConcept}."
                ),
                ChatMessage(
                    role=MessageRole.USER,
                    content=f"Is the user correct in saying '{user_input_text}' to explain the concept '{talkedConcept}'?"
                ),
            ]

            # Use LLM to validate user's input and return response
            response = llm.chat(messages)

            feedback = envaluator_feedback(str(response)[10:])
            print(feedback)
            if feedback!="negtive":

                update_notes(talkedConcept,"Review")
            
            return str(response)[10:], talkedConcept

        # Step 4: If the stage is 'Reviewing'
        elif concept_stage.lower() == 'review':

            update_notes(talkedConcept,"Review")
            return start_new_topic(user_input_text, talkedConcept, manager), talkedConcept
        else:
            "unknow stage","unknown"
    else:
        return "unknow agent","unknown"

def envaluator_feedback(llm_message):
    messages = [
        ChatMessage(
            role=MessageRole.SYSTEM,
            content=f"You are an assistant to envaluate an reply."
        ),
        ChatMessage(
            role=MessageRole.USER,
            content=f"In one word, is this positive or negtive by saying:{llm_message}'?"
        ),
    ]
    response = llm.chat(messages)
    return str(response)[10:]

def changeNoteToNextStage(talkedConcept):
    # Path to notes.json
    notes_path = 'Notes/notes.json'

    # Load existing notes
    if os.path.exists(notes_path):
        try:
            with open(notes_path, 'r') as file:
                notes = json.load(file)

            # Update the stage of the talkedConcept to 'review'
            concept_found = False
            for note in notes:
                if note["term"].lower() == talkedConcept.lower():
                    note["stage"] = "Review"  # Change the stage to 'Review'
                    concept_found = True
                    break

            # Write the updated notes back to the file if the concept was found
            if concept_found:
                with open(notes_path, 'w') as file:
                    json.dump(notes, file, indent=2)
                print(f"The stage for the concept '{talkedConcept}' has been updated to 'Review'.")
            else:
                print(f"Concept '{talkedConcept}' not found in notes.")

        except json.JSONDecodeError:
            print("Error decoding JSON from notes file.")
    else:
        print(f"Notes file not found at {notes_path}.")
