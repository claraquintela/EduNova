/**
 * User Controller
 * Handles all user-related business logic
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Privilege } = require("../config/db").models;
const redisClient = require("../services/redisClient");
const config = require("../config/config");

/**
 * Get all users - Admin only
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user exists in request
    if (!req.user) {
      console.log("No authenticated user in request");
      return res.status(401).json({ error: "No authenticated user" });
    }

    // Check admin privileges
    const userPrivilege = await Privilege.findByPk(req.user.privilege_id);

    if (!userPrivilege || userPrivilege.name !== "admin") {
      return res.status(403).json({ error: "Only admins can view users" });
    }

    // First try to get from cache
    const cachedUsers = await redisClient.get("all_users");
    if (cachedUsers) {
      return res.json(JSON.parse(cachedUsers));
    }

    // Fetch all users with their privileges if not in cache
    const users = await User.findAll({
      attributes: [
        "id",
        "username",
        "email",
        "birthday",
        "privilege_id",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Privilege,
          as: "privilege",
          attributes: ["name"],
        },
      ],
    });

    // Format user data for response
    const formattedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      birthday: user.birthday,
      privilege: user.privilege?.name || "no privilege",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    // Cache for 5 minutes
    await redisClient.set(
      "all_users",
      JSON.stringify(formattedUsers),
      "EX",
      300
    );

    return res.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      error: "Error fetching users",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update user information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, birthday, password, privilege_id } = req.body;

  try {
    // Check if the requesting user is an admin or the user themselves
    if (req.user.privilege_id !== "admin" && req.user.id !== parseInt(id)) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this user" });
    }

    // Find the user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prepare update object
    const updateData = {};

    // Only update fields that are provided and different from current values
    if (username && username !== user.username) {
      // Check if username is already taken
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername && existingUsername.id !== parseInt(id)) {
        return res.status(400).json({ error: "Username already taken" });
      }
      updateData.username = username;
    }

    if (email && email !== user.email) {
      // Check if email is already taken
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail && existingEmail.id !== parseInt(id)) {
        return res.status(400).json({ error: "Email already taken" });
      }
      updateData.email = email;
    }

    if (birthday && birthday !== user.birthday) {
      // Validate birthday format and logic
      const birthDate = new Date(birthday);
      const now = new Date();
      if (birthDate > now) {
        return res
          .status(400)
          .json({ error: "Birthday cannot be in the future" });
      }
      updateData.birthday = birthday;
    }

    // Only admins can update privilege_id
    if (privilege_id && req.user.privilege_id === "admin") {
      const privilege = await Privilege.findByPk(privilege_id);
      if (!privilege) {
        return res.status(400).json({ error: "Invalid privilege" });
      }
      updateData.privilege_id = privilege_id;
    }

    // Handle password update if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    await user.update(updateData);

    // Clear user cache
    await redisClient.del("all_users");
    await redisClient.del(`user_${id}`);

    // Return updated user without password
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Privilege,
          as: "privilege",
          attributes: ["name"],
        },
      ],
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      error: "Error updating user",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
