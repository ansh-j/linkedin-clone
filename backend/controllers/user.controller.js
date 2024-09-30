import cloudinary from "../lib/cloudinary.js";
import User from "../models/user.model.js"

export const getSuggestedConnections = async (req, res) => {

    try {
        const currentUser = await User.findById(req.user._id).select("connections");

        const suggestedUsers = await User.find({
            _id: {
                $ne: req.user._id, $nin: currentUser.connections
            }
        }).select("name username profilePicture headline").limit(3);

        res.json(suggestedUsers);
    }
    catch (error) {
        console.log("Error in getSuggestedUsers: ", error)
        res.status(500).json({ message: "Server Error" });
    }

}

export const getPublicProfile = async (req, res) => {

    try {
        const user = await User.findOne({ username: req.params.username }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    }
    catch (error) {
        console.log("Error in getPublicProfile: ", error)
        res.status(500).json({ message: "Server Error" });
    }
}

export const updateProfile = async (req, res) => { 
    try {
        const allowedFields = [
            "name",
            "username",
            "headline",
            "about",
            "location",
            "profilePicture",
            "bannerImg",
            "skills",
            "experience",
            "eduction",
        ]

        const updatedData = {};

        for (const field of allowedFields) {
            if (req.body[field]) {
                updatedData[field] = req.body[field];
            }
        }
       
        if(req.body.profilePicture) {
            const result = await cloudinary.uploader.upload(req.body.profilePicture);
            updatedData.profilePicture = result.secure_url;
        }

        if(req.body.bannerImg) {
            const result = await cloudinary.uploader.upload(req.body.bannerImg);
            updatedData.bannerImg = result.secure_url;
        }

        const user = await User.findByIdAndUpdate(req.user._id, updatedData, { new: true }).select("-pasword");

        res.json(user);
    } catch (error) {
        console.log("Error in updateProfile", error);
        res.status(500).json({ message: "Server Error" });
    }
};