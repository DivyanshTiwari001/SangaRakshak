# import cv2
# from skimage.metrics import structural_similarity as ssim
# # import numpy as np

# def calculate_ssim(image1_path, image2_path):
#     # Load the two input images
#     img1 = cv2.imread(image1_path)
#     img2 = cv2.imread(image2_path)
    
#     # Resize the second image to match the dimensions of the first image
#     img2_resized = cv2.resize(img2, (img1.shape[1], img1.shape[0]))
    
#     # Convert the images to grayscale
#     gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
#     gray2 = cv2.cvtColor(img2_resized, cv2.COLOR_BGR2GRAY)
    
#     # Calculate the Structural Similarity Index (SSIM)
#     score, diff = ssim(gray1, gray2, full=True)
    
#     # Scale the difference image to the range [0, 255]
#     diff = (diff * 255).astype("uint8")
    
#     return score * 100  # Return the percentage similarity

# # Example usage
# image1_path = './image1.jpg'
# image2_path = './image3.jpg'

# similarity_percentage = calculate_ssim(image1_path, image2_path)
# print(f"Similarity between the images: {similarity_percentage:.2f}%")



import tensorflow as tf
from tensorflow.keras import layers, models, Input
from tensorflow.keras.preprocessing import image
import numpy as np
import os

# Registering the custom function
@tf.keras.utils.register_keras_serializable()
def euclidean_distance(vectors):
    x, y = vectors
    sum_square = tf.reduce_sum(tf.square(x - y), axis=1, keepdims=True)
    return tf.sqrt(tf.maximum(sum_square, tf.keras.backend.epsilon()))

# Contrastive loss function
@tf.keras.utils.register_keras_serializable()
def contrastive_loss(y_true, y_pred):
    margin = 1.0
    square_pred = tf.square(y_pred)
    margin_square = tf.square(tf.maximum(margin - y_pred, 0))
    return tf.reduce_mean(y_true * square_pred + (1 - y_true) * margin_square)

# Load and preprocess images
def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(28, 28), color_mode="grayscale")
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array.astype("float32") / 255.0  # Normalize the image
    return img_array

# Define the base network (for both branches of the Siamese network)
def create_base_network(input_shape):
    model = models.Sequential()
    model.add(layers.Conv2D(32, (3, 3), activation='relu', input_shape=input_shape))
    model.add(layers.MaxPooling2D())
    model.add(layers.Conv2D(64, (3, 3), activation='relu'))
    model.add(layers.MaxPooling2D())
    model.add(layers.Flatten())
    model.add(layers.Dense(128, activation='relu'))
    model.add(layers.Dense(128, activation='relu'))
    return model

# Define the Siamese network
def create_siamese_network(input_shape):
    base_network = create_base_network(input_shape)
    
    input_a = Input(shape=input_shape)
    input_b = Input(shape=input_shape)
    
    # Both inputs pass through the same base network
    processed_a = base_network(input_a)
    processed_b = base_network(input_b)
    
    # Use Lambda layer to compute Euclidean distance
    distance = layers.Lambda(euclidean_distance)([processed_a, processed_b])
    
    # Create the final model
    model = models.Model([input_a, input_b], distance)
    return model

# File paths for saving/loading the model
model_path = "siamese_network.h5"

# Check if model exists, load it if available
if os.path.exists(model_path):
    print("Loading saved model...")
    siamese_model = tf.keras.models.load_model(model_path, custom_objects={"contrastive_loss": contrastive_loss, "euclidean_distance": euclidean_distance})
else:
    # Prepare the data
    from tensorflow.keras.datasets import mnist
    (input_train, label_train), (input_test, label_test) = mnist.load_data()
    input_train = np.expand_dims(input_train, axis=-1)  # Add channel dimension for Conv2D
    input_train = input_train.astype("float32") / 255.0
    input_test = np.expand_dims(input_test, axis=-1)
    input_test = input_test.astype("float32") / 255.0

    # Create pairs for training
    def create_pairs(x, y):
        pairs, labels = [], []
        num_classes = len(np.unique(y))
        digit_indices = [np.where(y == i)[0] for i in range(num_classes)]
        
        for idx in range(len(x)):
            current_digit = y[idx]
            positive_idx = np.random.choice(digit_indices[current_digit])
            pairs.append([x[idx], x[positive_idx]])
            labels.append(1)  # Positive pair
            
            # Negative pair
            different_digit = (current_digit + np.random.randint(1, num_classes)) % num_classes
            negative_idx = np.random.choice(digit_indices[different_digit])
            pairs.append([x[idx], x[negative_idx]])
            labels.append(0)  # Negative pair
        
        return np.array(pairs), np.array(labels)

    pairs_train, labels_train = create_pairs(input_train, label_train)
    pairs_test, labels_test = create_pairs(input_test, label_test)
    
    # Define input shape
    input_shape = input_train.shape[1:]
    
    # Create and compile the Siamese network
    siamese_model = create_siamese_network(input_shape)
    siamese_model.compile(loss=contrastive_loss, optimizer="adam", metrics=["accuracy"])

    # Train the model
    print("Training the model...")
    siamese_model.fit(
        [pairs_train[:, 0], pairs_train[:, 1]],
        labels_train,
        validation_data=([pairs_test[:, 0], pairs_test[:, 1]], labels_test),
        epochs=10,
        batch_size=128,
    )

    # Save the trained model
    print("Saving the trained model...")
    siamese_model.save(model_path)

# Function to compute similarity between two images (output as percentage similarity)
def compute_similarity(img1_path, img2_path):
    # Preprocess the input images
    img1 = preprocess_image(img1_path)
    img2 = preprocess_image(img2_path)
    
    # Get the distance prediction from the Siamese network
    distance = siamese_model.predict([img1, img2])[0][0]
    
    # Normalize the distance (smaller distance = higher similarity)
    similarity_percentage = max(0, 1 - distance) * 100  # Convert to percentage
    
    return similarity_percentage

# # Example usage: provide two image file paths
# img1_path = './resources/objectImage.jpeg'  # Path to the first image
# img2_path = './resources/userImage.jpeg'  # Path to the second image

# similarity_score = compute_similarity(img1_path, img2_path)
# print(f"Similarity between the images: {similarity_score:.2f}%")


