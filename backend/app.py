from flask import Flask, request, jsonify
from helper_module import process_user_input

app = Flask(__name__)

@app.route('/')
def index():
    return 'I am a server'

# Endpoint to handle user input from the front-end
@app.route('/api/user-input', methods=['POST'])
def user_input():
    data = request.get_json()
    user_input_text = data.get('userInput', '')

    # Use external function to process the user input
    response = process_user_input(user_input_text)

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)
