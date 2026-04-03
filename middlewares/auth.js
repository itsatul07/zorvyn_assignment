import jwt from "jsonwebtoken";
export const isAuthenticated = (req, res, next) => {
  // 1. Get token from cookie
  const token = req.cookies.token;
  //console.log("Token from cookie:", token); // Debugging line

  if (!token) return res.status(401).json({ message: "Not logged in" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decoded; 
  // { userId, role }

  next();
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
