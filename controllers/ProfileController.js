import User from "../models/UserModels.js";

export const currentUserProfile = async  (req, res) => {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    //
    console.log("Current user from token:", req.user); // Debugging line
    res.status(200).json({ user });
};

export const getAnotherUserProfile = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ user });
};