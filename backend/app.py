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

@app.route("/query", methods=["GET"])
def query_index():
    global index
    query_text = request.args.get("text", None)
    if query_text is None:
        return (
            "No text found, please include a ?text=blah parameter in the URL",
            400,
        )
    query_engine = index.as_query_engine()
    response = query_engine.query(query_text)
    return str(response), 200


@app.route("/uploadFile", methods=["POST"])
def upload_file():
    global manager
    if "file" not in request.files:
        return "Please send a POST request with a file", 400

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
        return "Error: {}".format(str(e)), 500

    # cleanup temp file
    if filepath is not None and os.path.exists(filepath):
        os.remove(filepath)

    return "File inserted!", 200
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)
