from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return 'I am a server'

# Endpoint to handle user input from the front-end
@app.route('/api/user-input', methods=['POST'])
def user_input():
    data = request.get_json()
    user_input_text = data.get('userInput', '')

    # Sample logic for generating agent response based on user input
    if 'admin' in user_input_text.lower():
        response = {
            "agentname": "Dean",
            "reply": "I am the Dean of this mini UIUC, feel free to ask me any admin-related questions!"
        }
    elif 'feynman' in user_input_text.lower():
        response = {
            "agentname": "Feynman",
            "reply": "I am here to help you understand concepts using the Feynman method!"
        }
    else:
        response = {
            "agentname": "Dean",
            "reply": "I didn't quite understand that. Can you please clarify?"
        }
    print(jsonify(response))

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
