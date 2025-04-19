import React, { useState } from 'react'

const ChipInput = ({ label, name, placeholder, register, errors, setValue, getValues }) => {
    const [inputValue, setInputValue] = useState('')
    const [tags, setTags] = useState([])

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim() !== '') {
            e.preventDefault()
            const newTags = [...tags, inputValue.trim()]
            setTags(newTags)
            setValue(name, newTags)
            setInputValue('')
        }
    }

    const handleDeleteTag = (index) => {
        const newTags = tags.filter((_, i) => i !== index)
        setTags(newTags)
        setValue(name, newTags)
    }

    return (
        <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor={name}>
                {label} <sup className="text-pink-200">*</sup>
            </label>
            <div className="flex flex-wrap gap-2 p-2 border border-richblack-700 rounded-md bg-richblack-800">
                {tags.map((tag, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-richblack-5 bg-richblack-700 rounded-full"
                    >
                        <span>{tag}</span>
                        <button
                            type="button"
                            onClick={() => handleDeleteTag(index)}
                            className="text-richblack-200 hover:text-richblack-5"
                        >
                            ×
                        </button>
                    </div>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent border-none outline-none text-richblack-5 placeholder-richblack-400"
                />
            </div>
        </div>
    )
}

export default ChipInput 