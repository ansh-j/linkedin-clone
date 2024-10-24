import Notification from "../models/notification.model.js";

export const    getUserNotifications = async (req, res) => {
    try {
        const notification = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 })
            .populate("relatedUser", "name username profilePicture")
            .populate("relatedPost", "content image")

        res.status(200).json(notification);

    } catch (error) {

        console.log("Erroor in getUserNotifications controller", error);
        res.status(500).json({ message: "Server Error" });
    }
}

export const markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const notification = await Notification.findByIdAndUpdate(
            { _id: notificationId, recipient: req.body._id },
            { read: true },
            { new: true }
        );

        res.status(200).json(notification);
    }
    catch (error) {

        console.log("Error in markNotificationAsRead controller", error);
        res.status(500).json({ message: "Server Error" });
    }
}
export const deleteNotification = async (req, res) => {
    const notificationId = req.params.id;

    try {
        await Notification.findByIdAndDelete(
            {
                _id: notificationId,
                recipient: req.body._id
            }
        );

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        console.log("Error in deleteNotification controller", error);
        res.status(500).json({ message: "Server Error" });
    }

}