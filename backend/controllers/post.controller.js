import { sendCommentNotificationEmail } from "../emails/emailHandlers.js";
import cloudinary from "../lib/cloudinary.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";

export const getFeedPosts = async (req, res) => {
    try {

        const posts = await Post.find({
            author: { $in: [...req.user.connections, , req.user._id] }
        }).populate(
            "author", "name username profilePicture headline"
        ).populate(
            "comments.user", "name profilePicture"
        ).sort({
            createdAt: -1
        })

        res.status(200).json(posts)

    } catch (error) {
        console.log("Error in getFeedPost controller: ", error);
        res.status(500).json({ message: "Server Error", })
    }
}

export const createPost = async (req, res) => {
    try {
        const { content, image } = req.body;

        let newPost;

        if (image) {
            const imgResult = await cloudinary.uploader.upload(image);
            newPost = new Post({
                author: req.user._id,
                image: imgResult.secure_url,
                content,
            })

        } else {
            newPost = new Post({
                author: req.user._id,
                content
            })
        }

        await newPost.save();

        res.status(201).json({ message: "Post created successfully", newPost })

    } catch (error) {
        console.log("Error in createPost controller: ", error);
        res.status(500).json({ message: "Server Error", })
    }
}

export const deletePost = async (req, res) => {

    try {

        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }

        // check if current user is author of the post
        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized - You are not the author of this post" })
        }

        if (post.image) {
            await cloudinary.uploader.destroy(post.image.split('/').pop().split(".")[0])
        }

        await post.deleteOne()

        res.status(200).json({ message: "Post deleted successfully" })

    } catch (error) {
        console.log("Error in DeletePost controller", error)
        res.status(500).json({ message: "Server Error" })
    }
}

export const getPostByid = async (req, res) => {
    try {

        const postId = req.params.id;

        const post = await Post.findById(postId)
            .populate("author", "name username profilePicture headline")
            .populate("comments.user", "name profilePicture username headline")

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json(post);


    } catch (error) {
        console.log("Error in getPostById controller", error)
        res.status(500).json({ message: "Server Error" })
    }
}

export const createComment = async (req, res) => {
    try {

        const postId = req.params.id;
        const { content } = req.body;

        const post = await Post.findByIdAndUpdate(postId, {
            $push: {
                comments: {
                    user: req.user._id,
                    content
                }
            }
        }, { new: true }).populate(
            "author", "name email profilePicture username headline"
        )

        if (post.author._id.toString() !== req.user._id.toString()) {
            const newNotification = new Notification({
                recipient: post.author._id,
                type: "comment",
                relatedUser: req.user._id,
                relatedPost: postId,
            })

            await newNotification.save()

            try {
                const postUrl = `${process.env.CLIENT_URL}/post/${postId}`;
                await sendCommentNotificationEmail(post.author.email, post.author.name, req.user.name, postUrl, content)
            }
            catch (error) {
                console.log("Error in sendCommentNotification", error);
            }
        }

        res.status(200).json(post)

    } catch (error) {

        console.log("Error in createComment controller", error)
        res.status(500).json({ message: "Server Error" })
    }
}

export const likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;
        const post = await Post.findById(postId);


        if (post.likes.includes(userId)) {
            // unlike the post
            await Post.updateOne(
                { _id: postId },
                { $pull: { likes: userId } }
            )
        }
        else {
            // like the post
            await Post.updateOne(
                { _id: postId },
                { $push: { likes: userId } }
            )
            if (post.author.toString() !== userId.toString()) {

                const newNotification = new Notification({
                    recipient: post.author,
                    type: "like",
                    relatedUser: userId,
                    relatedPost: postId,
                })

                await newNotification.save()
            }
        }

        res.status(200).json(post)
    } catch (error) {
        console.log("Error in likePost controller", error)
        res.status(500).json({ message: "Server Error" })
    }
}