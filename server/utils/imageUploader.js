const cloudinary = require('cloudinary').v2


exports.uploadImageToCloudinary  = async (file, folder, resource_type, fileNameWithExtension, height, quality) => {
    const options = {folder, access_mode: "public"};
    if(height) {
        options.height = height;
    }
    if(quality) {
        options.quality = quality;
    }
    if(fileNameWithExtension) {
        options.public_id = `${fileNameWithExtension}`
    }
    options.resource_type = resource_type || "auto";

    return await cloudinary.uploader.upload(file.tempFilePath, options);
}