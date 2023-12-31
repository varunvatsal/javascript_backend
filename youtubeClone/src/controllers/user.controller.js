import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {User} from '../models/user.models.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'

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

const loginUser = asyncHandler(async (req, res)=>{
    //take user credentials from frontend
    //check if all the neccessary fields are present 
    //find the user **
    //return fail if user not present or show to the registration page **
    //match the passwords
    //generate accesstoken and referesh token send it back to user, maybe in cookies

    const {email, username, password} = req.body

    if(!username || !email){
        throw new ApiError(400, "username or email is required")
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
export {registerUser, loginUser}