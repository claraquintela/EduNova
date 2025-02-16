const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { models } = require("../config/db");
const redisClient = require("../services/redisClient");

/**
 * Authentication middleware
 * Verifies JWT token and checks Redis for valid session
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("Authorization Header:", authHeader);
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token missing" });
    }

    // First verify the token structure
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      console.error("Token verification error:", err);
      return res.status(401).json({
        error: "Invalid token",
      });
    }

    try {
      // Check if token exists in Redis
      const storedToken = await redisClient.get(`auth_token_${decoded.id}`);

      if (!storedToken || storedToken !== token) {
        return res
          .status(401)
          .json({ error: "Session expired or invalidated" });
      }

      // Use models directly from the imported db config
      const { User, Privilege } = models;

      const user = await User.findOne({
        where: { id: decoded.id },
        include: [
          {
            model: Privilege,
            as: "privilege",
            attributes: ["name"],
          },
        ],
      });

      if (!user) {
        // If user not found, clear the invalid session
        await redisClient.del(`auth_token_${decoded.id}`);
        return res.status(401).json({ error: "User not found" });
      }

      // Attach complete user info to request
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username || user.name,
        privilege: user.privilege ? { name: user.privilege.name } : null,
      };

      // Optionally refresh Redis TTL here if you want to extend session on activity
      // await redisClient.expire(`auth_token_${decoded.id}`, 24 * 60 * 60); // 24 hours

      next();
    } catch (error) {
      console.error("Error fetching user data:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during authentication" });
  }
};

module.exports = authenticateToken;
