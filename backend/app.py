from flask import Flask, request, jsonify
from helper_module import process_user_input
from multiprocessing.managers import BaseManager
import os

manager = BaseManager(("", 5602), b"password")
manager.register("query_index")
manager.register("insert_into_index")

manager.connect()

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

@app.route("/api/query", methods=["GET"])
def query_index():
    query_text = request.args.get("text", None)
    if query_text is None:
        return (
            "No text found, please include a ?text=blah parameter in the URL",
            400,
        )
    response = manager.query_index(query_text)
    
    return str(response), 200


@app.route("/api/uploadFile", methods=["POST"])
def upload_file():
    global manager
    if "file" not in request.files:
        return jsonify({"error":"Please send a POST request with a file"}), 400

    filepath = None
    try:
        uploaded_file = request.files["file"]
        filename = uploaded_file.filename
        filepath = os.path.join("documents", os.path.basename(filename))
        uploaded_file.save(filepath)

        if request.form.get(filename, None) is not None:
            
            manager.insert_into_index(filepath, doc_id=filename)
        else:

            manager.insert_into_index(filepath)

        
    except Exception as e:
        # cleanup temp file
        if filepath is not None and os.path.exists(filepath):
            os.remove(filepath)
        
        return jsonify({"error": f"Error: {str(e)}"}), 500

    return jsonify({"message": "File inserted successfully!", "filename": filename}), 200
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)
