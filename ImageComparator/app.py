from flask import Flask, request, jsonify
import os
from flask_cors import CORS  
from werkzeug.utils import secure_filename
from util import compute_similarity
from xray_util import calculate_xray_similarity

app = Flask(__name__)
CORS(app)  

UPLOAD_FOLDER = 'resources'  # Folder where uploaded images will be stored
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the resources folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Endpoint to get similarity scores for one or two pairs of images
@app.route('/api/v1/customer/get-similarity', methods=['POST'])
def get_similarity():
    try:
        # Save received files
        file_paths = {}
        required_files = ['image1', 'image2']
        optional_files = ['image3', 'image4']
        x_ray_files = ['xray1', 'xray2']

        # Check for required files
        for file_key in required_files:
            if file_key not in request.files:
                return jsonify({"error": f"{file_key} is required"}), 400

            # Save required files
            uploaded_file = request.files[file_key]
            filename = secure_filename(uploaded_file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            uploaded_file.save(file_path)
            file_paths[file_key] = file_path

        # Check for optional files
        for file_key in optional_files:
            if file_key in request.files:
                uploaded_file = request.files[file_key]
                filename = secure_filename(uploaded_file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                uploaded_file.save(file_path)
                file_paths[file_key] = file_path

        # Check for x_ray files
        for file_key in x_ray_files:
            if file_key in request.files:
                uploaded_file = request.files[file_key]
                filename = secure_filename(uploaded_file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                uploaded_file.save(file_path)
                file_paths[file_key] = file_path

        # Compute similarity scores
        response = {}
        print("Bug 0")

        response['custScore'] = compute_similarity(file_paths['image1'], file_paths['image2'])

        print("Bug 1")

        if 'image3' in file_paths and 'image4' in file_paths:
            response['objectScore'] = compute_similarity(file_paths['image3'], file_paths['image4'])

        print("Bug 2")

        if 'xray1' in file_paths and 'xray2' in file_paths:
            response['xrayScore'] = calculate_xray_similarity(file_paths['xray1'], file_paths['xray2'])

        # Delete all images after processing
        for file_path in file_paths.values():
            os.remove(file_path)

        return jsonify(response)

    except Exception as e:
        # Clean up resources on failure
        for file_path in file_paths.values():
            if os.path.exists(file_path):
                os.remove(file_path)

        # Log error and respond with an error message
        print(f"Error processing images: {e}")
        return jsonify({"error": "An error occurred while processing the images"}), 500


if __name__ == '__main__':
    port = 8080
    print(f"Server running at {port}")
    app.run(debug=True, port=port)
