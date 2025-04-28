import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import IconBtn from '../../../common/IconBtn'
import { toast } from 'react-hot-toast'
import Upload from './Upload'
import { createInstitute } from '../../../../services/operations/serviceProviderAPI'
import { useNavigate } from 'react-router-dom'

const CreateInstitute = () => {
    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useForm()

    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const onSubmit = async (data) => {
        console.log("Submit button clicked")
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('adminFirstName', data.adminFirstName)
            formData.append('adminLastName', data.adminLastName)
            formData.append('adminEmail', data.adminEmail)
            formData.append('password', data.password)
            formData.append('instituteName', data.instituteName)
            formData.append('instituteAddress', data.instituteAddress)
            formData.append('contactNumber', data.contactNumber)
            formData.append('instituteEmail', data.instituteEmail)
            formData.append('website', data.website)
            formData.append('instituteLogo', data.instituteLogo)

            const result = await createInstitute(formData)
            console.log("Result of create institute", result)
            if (result?.success) {
                navigate('/dashboard/my-institutes')
            }
        } catch (error) {
            console.error('Error creating institute:', error)
            toast.error('Failed to create institute')
        }
        setLoading(false)
    }

    return (
        <div className='w-[80%]'>
            <h1 className="mb-14 text-3xl font-medium text-richblack-5">Create Institute</h1>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-8 mx-auto rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6"
            >
                <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-sm text-richblack-5" htmlFor="adminFirstName">
                                Admin First Name<sup className="text-pink-200">*</sup>
                            </label>
                            <input
                                type="text"
                                name="adminFirstName"
                                id="adminFirstName"
                                placeholder="Enter Admin First Name"
                                {...register('adminFirstName', {
                                    required: true,
                                })}
                                className="form-style w-full"
                            />
                            {errors.adminFirstName && (
                                <span className="ml-2 text-xs tracking-wide text-pink-200">
                                    Admin First Name is Required**
                                </span>
                            )}
                        </div>

                        <div>
                            <label className="text-sm text-richblack-5" htmlFor="adminLastName">
                                Admin Last Name<sup className="text-pink-200">*</sup>
                            </label>
                            <input
                                type="text"
                                name="adminLastName"
                                id="adminLastName"
                                placeholder="Enter Admin Last Name"
                                {...register('adminLastName', {
                                    required: true,
                                })}
                                className="form-style w-full"
                            />
                            {errors.adminLastName && (
                                <span className="ml-2 text-xs tracking-wide text-pink-200">
                                    Admin Last Name is Required**
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-sm text-richblack-5" htmlFor="adminEmail">
                                Admin Email<sup className="text-pink-200">*</sup>
                            </label>
                            <input
                                type="email"
                                name="adminEmail"
                                id="adminEmail"
                                placeholder="Enter Admin Email"
                                {...register('adminEmail', {
                                    required: true,
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                                className="form-style w-full"
                            />
                            {errors.adminEmail && (
                                <span className="ml-2 text-xs tracking-wide text-pink-200">
                                    {errors.adminEmail.message || 'Admin Email is Required**'}
                                </span>
                            )}
                        </div>

                        <div>
                            <label className="text-sm text-richblack-5" htmlFor="password">
                                Admin Password<sup className="text-pink-200">*</sup>
                            </label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="Enter Admin Password"
                                {...register('password', {
                                    required: true,
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters long',
                                    },
                                })}
                                className="form-style w-full"
                            />
                            {errors.password && (
                                <span className="ml-2 text-xs tracking-wide text-pink-200">
                                    {errors.password.message || 'Password is Required**'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-richblack-5" htmlFor="instituteName">
                            Institute Name<sup className="text-pink-200">*</sup>
                        </label>
                        <input
                            type="text"
                            name="instituteName"
                            id="instituteName"
                            placeholder="Enter Institute Name"
                            {...register('instituteName', {
                                required: true,
                            })}
                            className="form-style w-full"
                        />
                        {errors.instituteName && (
                            <span className="ml-2 text-xs tracking-wide text-pink-200">
                                Institute Name is Required**
                            </span>
                        )}
                    </div>

                    <div>
                        <label className="text-sm text-richblack-5" htmlFor="instituteAddress">
                            Institute Address<sup className="text-pink-200">*</sup>
                        </label>
                        <textarea
                            name="instituteAddress"
                            id="instituteAddress"
                            placeholder="Enter Institute Address"
                            {...register('instituteAddress', {
                                required: true,
                            })}
                            className="form-style w-full"
                        />
                        {errors.instituteAddress && (
                            <span className="ml-2 text-xs tracking-wide text-pink-200">
                                Institute Address is Required**
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-sm text-richblack-5" htmlFor="contactNumber">
                                Contact Number<sup className="text-pink-200">*</sup>
                            </label>
                            <input
                                type="tel"
                                name="contactNumber"
                                id="contactNumber"
                                placeholder="Enter Contact Number"
                                {...register('contactNumber', {
                                    required: true,
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: 'Invalid phone number',
                                    },
                                })}
                                className="form-style w-full"
                            />
                            {errors.contactNumber && (
                                <span className="ml-2 text-xs tracking-wide text-pink-200">
                                    {errors.contactNumber.message || 'Contact Number is Required**'}
                                </span>
                            )}
                        </div>

                        <div>
                            <label className="text-sm text-richblack-5" htmlFor="instituteEmail">
                                Institute Email<sup className="text-pink-200">*</sup>
                            </label>
                            <input
                                type="email"
                                name="instituteEmail"
                                id="instituteEmail"
                                placeholder="Enter Institute Email"
                                {...register('instituteEmail', {
                                    required: true,
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                                className="form-style w-full"
                            />
                            {errors.instituteEmail && (
                                <span className="ml-2 text-xs tracking-wide text-pink-200">
                                    {errors.instituteEmail.message || 'Institute Email is Required**'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-richblack-5" htmlFor="website">
                            Website
                        </label>
                        <input
                            type="url"
                            name="website"
                            id="website"
                            placeholder="Enter Website URL"
                            {...register('website', {
                                pattern: {
                                    value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                                    message: 'Invalid website URL',
                                },
                            })}
                            className="form-style w-full"
                        />
                        {errors.website && (
                            <span className="ml-2 text-xs tracking-wide text-pink-200">
                                {errors.website.message}
                            </span>
                        )}
                    </div>
                </div>

                {/* Component for uploading and showing preview of media */}
                <Upload
                    name="instituteLogo"
                    label="Institute Logo"
                    register={register}
                    errors={errors}
                    setValue={setValue}
                />

                <div className="flex justify-end gap-x-4">
                    <IconBtn
                        type="submit"
                        disabled={loading}
                        text={loading ? 'Creating...' : 'Create Institute'}
                    />
                </div>
            </form>
        </div>
    )
}

export default CreateInstitute 