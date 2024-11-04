
def process_user_input(user_input_text):
    # Process the user input and generate an appropriate response
    if 'admin' in user_input_text.lower():
        return {
            "agentname": "Dean",
            "reply": "I am the Dean of this mini UIUC, feel free to ask me any admin-related questions!"
        }
    elif 'feynman' in user_input_text.lower():
        return {
            "agentname": "Feynman",
            "reply": "I am here to help you understand concepts using the Feynman method!"
        }
    else:
        return {
            "agentname": "Dean",
            "reply": "I didn't quite understand that. Can you please clarify?"
        }