from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename
from util import compute_similarity 

app = Flask(__name__)
UPLOAD_FOLDER = 'resources'  # Folder where uploaded images will be stored
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the resources folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Endpoint to get similarity between two images
@app.route('/api/v1/customer/get-similarity', methods=['POST'])
def get_similarity():
    # Ensure the request contains files
    if 'image1' not in request.files or 'image2' not in request.files:
        return jsonify({"error": "Both images are required"}), 400

    # Get the uploaded images
    image1 = request.files['image1']
    image2 = request.files['image2']

    # Save images to the resources folder
    image1_filename = secure_filename(image1.filename)
    image1_path = os.path.join(app.config['UPLOAD_FOLDER'], image1_filename)
    image1.save(image1_path)

    image2_filename = secure_filename(image2.filename)
    image2_path = os.path.join(app.config['UPLOAD_FOLDER'], image2_filename)
    image2.save(image2_path)

    # Call the function from util.py to get similarity
    similarity_score = compute_similarity(image1_path, image2_path)

    # Delete the images after processing
    try:
        os.remove(image1_path)
        os.remove(image2_path)
    except Exception as e:
        print(f"Error deleting images: {e}")

    return jsonify({"similarity_score": similarity_score})

if __name__ == '__main__':
    port=8080
    print(f"Server running at {port}")
    app.run(debug=True, port=port)
