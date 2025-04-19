import React, { useState } from 'react'
import { BiUpload } from 'react-icons/bi'

const Upload = ({ name, label, register, errors, setValue }) => {
    const [previewSource, setPreviewSource] = useState('')

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file type
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
            if (!validTypes.includes(file.type)) {
                setValue(name, null)
                setPreviewSource('')
                return
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setValue(name, null)
                setPreviewSource('')
                return
            }

            previewFile(file)
            setValue(name, file)
        }
    }

    const previewFile = (file) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = () => {
            setPreviewSource(reader.result)
        }
    }

    return (
        <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor={name}>
                {label} <sup className="text-pink-200">*</sup>
            </label>
            <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-center w-full">
                    <label
                        htmlFor={name}
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-richblack-500 border-dashed rounded-lg cursor-pointer bg-richblack-700 hover:bg-richblack-600"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <BiUpload className="w-8 h-8 mb-4 text-richblack-200" />
                            <p className="mb-2 text-sm text-richblack-200">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-richblack-200">
                                PNG, JPG or GIF (MAX. 5MB)
                            </p>
                        </div>
                        <input
                            id={name}
                            type="file"
                            className="hidden"
                            accept="image/png, image/jpeg, image/jpg, image/gif"
                            {...register(name, { 
                                required: false,
                                validate: {
                                    fileSize: (value) => {
                                        if (value) {
                                            return value.size <= 5 * 1024 * 1024 || "File size should be less than 5MB"
                                        }
                                        return true
                                    },
                                    fileType: (value) => {
                                        if (value) {
                                            const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
                                            return validTypes.includes(value.type) || "Only PNG, JPG, and GIF files are allowed"
                                        }
                                        return true
                                    }
                                }
                            })}
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
                {previewSource && (
                    <div className="mt-2">
                        <img
                            src={previewSource}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-lg"
                        />
                    </div>
                )}
            </div>
            {errors[name] && (
                <span className="ml-2 text-xs tracking-wide text-pink-200">
                    {errors[name].message || `${label} is required`}
                </span>
            )}
        </div>
    )
}

export default Upload 