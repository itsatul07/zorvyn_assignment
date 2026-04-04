import User from "../models/UserModels.js";
import Transaction from "../models/TransactionModel.js";

//name already suggests, this controller is for admin for viewing all users.
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//so that admin can delete a user and also all the transactions created by that user.
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    //  Delete user's transactions
    await Transaction.deleteMany({ createdBy: id });

    // Delete user
    await User.findByIdAndDelete(id);

    res.json({ message: "User and their transactions deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//admin can change roles of users and also create a user if needed. and the role can be sent in the body of the request.
export const changeUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    //console.log("Received userId and role in changeUserRole:", { userId, role }); // Debugging line
    // Valid roles
    const allowedRoles = ["viewer", "analyst", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

   const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    user.role = role;
    await user.save();

    res.json({ message: "Role updated", user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};    