import User from "../models/UserModels.js";


//profile related controllers
//for the current user, we can get the user id from the token and fetch the user details from the database and return it to the client
export const currentUserProfile = async  (req, res) => {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.status(200).json({ user });
};

//for another user, we can get the user id from the url parameter and fetch the user details from the database and return it to the client
export const getAnotherUserProfile = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ user });
};