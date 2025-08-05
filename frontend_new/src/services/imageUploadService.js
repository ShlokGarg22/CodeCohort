const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ImageUploadService {
  async uploadProfileImage(file) {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPEG, JPG, PNG, and WebP images are allowed');
      }

      const formData = new FormData();
      formData.append('profileImage', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/upload/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload image');
      }

      return {
        success: true,
        imageUrl: data.imageUrl,
        publicId: data.publicId,
        message: data.message,
        user: data.user
      };
    } catch (error) {
      console.error('Image upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteProfileImage() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/upload/profile-image`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete image');
      }

      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      console.error('Image deletion error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper method to create object URL for preview
  createPreviewUrl(file) {
    return URL.createObjectURL(file);
  }

  // Helper method to revoke object URL
  revokePreviewUrl(url) {
    URL.revokeObjectURL(url);
  }
}

export default new ImageUploadService();
