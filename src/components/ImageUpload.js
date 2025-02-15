import React, { useState } from 'react';

function ImageUpload() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create a URL for the selected image
      const url = URL.createObjectURL(file);
      setImage(file);
      setImageUrl(url);
    }
  };

  const handleUpload = async () => {
    if (image) {
      const formData = new FormData();
      formData.append('file', image);  // The 'file' is the field name expected by the backend

      setUploading(true);

      try {
        const response = await fetch('http://localhost:5001/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setUploadedImageUrl(data.url);  // URL returned from the backend
          alert('Image uploaded successfully!');
        } else {
          alert('Failed to upload image');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('An error occurred while uploading the image');
      } finally {
        setUploading(false);
      }
    } else {
      alert('Please select an image first!');
    }
  };

  return (
    <div>
      <h2>Upload an Image</h2>

      <input type="file" onChange={handleImageChange} />
      
      {imageUrl && (
        <div>
          <h3>Preview:</h3>
          <img src={imageUrl} alt="Image Preview" width="300" />
        </div>
      )}

      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>

      {uploadedImageUrl && (
        <div>
          <h3>Uploaded Image:</h3>
          <img src={uploadedImageUrl} alt="Uploaded Image" width="300" />
        </div>
      )}
    </div>
  );
}

export default ImageUpload;