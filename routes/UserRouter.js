import express from "express";
const UserRouter = express.Router();

UserRouter.route("/users").get((req,res)=>{
    res.send("Users")
})
export default UserRouter;