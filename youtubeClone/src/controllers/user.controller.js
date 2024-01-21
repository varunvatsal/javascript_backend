import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {User} from '../models/user.models.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import jwt from "jsonwebtoken"
import mongoose from 'mongoose'
const generateAccessAndRefereshTokens = async (userId)=>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})//we only changed one field therefore we have to bypass 
        // required fields validation

        return {accessToken, refreshToken}

    }catch(error){
        throw new ApiError(500, "refresh and access token not generated")
    }
}

const registerUser = asyncHandler(async (req, res)=> {
    //take input from frontend
    //check if the input is valid -> check if the values are not empty
    //check if the user already registered, either username or email
    //check for images, check for avatar
    //upload them to cloudinary, avatar
    //create user object -> create entry in db
    //remove encrypted password and refresh token field from response
    //check for user creation==completed? return res=good: return res=bad

    const {fullName, email, username, password}=req.body
    console.log(username)

    if([fullName, email, username, password].some((field)=>
    field?.trim()===""))
    {
        throw new ApiError(400, "all fields are required")
    }
    const existedUser = User.findOne({
        $or:[{username}, {email}]
    })
    
    if(existedUser){
        throw new ApiError(409, "user with with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    
    if(!avatarLocalPath){
        throw new ApiError(400, "avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400, "avatar file is required")
    }

    const user = await User.create({
        fullName, 
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, "user registration failed")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )

})

const loginUser = asyncHandler(async(req, res)=>{
    //take user credentials from frontend
    //check if all the neccessary fields are present 
    //find the user **
    //return fail if user not present or show to the registration page **
    //match the passwords
    //generate accesstoken and referesh token send it back to user, maybe in cookies

    const {email, username, password} = req.body

    if(!username && !email){
        throw new ApiError(400, "username or email is required, both are not present")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "user does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "password incorrect")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "user logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    //access cokkie in res and clear tokens 
    //clear tokes in User database 
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken: undefined //effectively logout the user from database side
            }
        },
        {
            new: true
        }
    )
    
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User logged out"))
})

const refreshAccessToken = asyncHandler(async(req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }

   try {
        const decodedToken = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id) 
    
        if(!user){
            throw new ApiError(401, "invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "refresh token is expired or used")
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        const options = {
        httpOnly: true,
        secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
        new ApiResponse(
            200,
            { accessToken, refreshToken: newRefreshToken},
            "access token refreshed"
            )
        )
   } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
   }
})

const changeCurrentPassword = asyncHandler(async(req, res)=>{
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req, res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req, res)=>{
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "all fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "account details updated successfully"))
    
})

// create a function to delete old avatar or cover image
const updateUserAvatar = asyncHandler(async (req, res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "error while uploading the avatar on cloudniray")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar updated succefully"))
})

const updateUserCoverImage = asyncHandler(async (req, res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "cover image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "error while uploading the cover image on cloudniray")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image updated succefully"))
})

const getUserChannelProfile = asyncHandler(async (req, res)=>{
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400, "username is missing")
    }

    //User.find({username}), aggregation piplines
    const channel = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",// lowercase and plural means Subscription-> subscriptions
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",// lowercase and plural means Subscription-> subscriptions
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size: "$subscribers"
                },
                channelsSubscribedToCount:{
                    $size: "$subscribedTo"
                },
                $isSubscribed:{
                    $cond:{
                        if:{$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullName: 1,
                username: 1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404, "channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "channel details fetched successfully")
    )

})
// revise this controller
const getWatchHistory = asyncHandler(async (req, res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project:{
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,

                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0].getWatchHistory, "watch history fetched succeddfully")
    )
})

export {registerUser,
        loginUser, 
        logoutUser, 
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar,
        updateUserCoverImage,
        getUserChannelProfile,
        getWatchHistory,
    }