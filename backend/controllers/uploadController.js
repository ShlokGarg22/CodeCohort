const { cloudinary } = require('../config/cloudinary');
const User = require('../models/User');

// Upload profile image
const uploadProfileImage = async (req, res) => {
  console.log('Upload endpoint hit!');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('User ID:', req.user?.id);
  console.log('File:', req.file ? 'Present' : 'Missing');
  
  try {
    if (!req.file) {
      console.log('No file provided in request');
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const userId = req.user.id;
    const imageUrl = req.file.path; // Cloudinary URL
    const publicId = req.file.filename; // Cloudinary public ID

    // Update user's profile image in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        profileImage: imageUrl,
        cloudinaryPublicId: publicId // Store public ID for deletion
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      // If user update fails, try to delete the uploaded image from Cloudinary
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
      }
      
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl: imageUrl,
      publicId: publicId,
      user: updatedUser
    });

  } catch (error) {
    console.error('Image upload error:', error);
    
    // If there's an error and a file was uploaded, try to clean it up
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (deleteError) {
        console.error('Error cleaning up uploaded image:', deleteError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

// Delete profile image
const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's current profile image info
    const user = await User.findById(userId).select('profileImage cloudinaryPublicId');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.profileImage || !user.cloudinaryPublicId) {
      return res.status(400).json({
        success: false,
        message: 'No profile image to delete'
      });
    }

    // Delete image from Cloudinary
    try {
      await cloudinary.uploader.destroy(user.cloudinaryPublicId);
    } catch (cloudinaryError) {
      console.error('Error deleting image from Cloudinary:', cloudinaryError);
      // Continue with database update even if Cloudinary deletion fails
    }

    // Update user record to remove profile image
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $unset: { 
          profileImage: 1,
          cloudinaryPublicId: 1
        }
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile image deleted successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};

module.exports = {
  uploadProfileImage,
  deleteProfileImage
};
