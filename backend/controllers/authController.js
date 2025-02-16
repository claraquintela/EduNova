const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const config = require("../config/config");
const redisClient = require("../services/redisClient");

const authController = {
  /**
   * User registration controller
   */
  register: async (req, res) => {
    const { username, email, password } = req.body;

    try {
      // Input validation
      if (!username || !email || !password) {
        return res.status(400).json({
          error: "All fields are required",
          details: {
            message: "Username, email and password are required",
          },
        });
      }

      // Check for existing user with same email or username
      const existingUser = await db.User.findOne({
        where: {
          [db.Sequelize.Op.or]: [{ email }, { username }],
        },
      });

      if (existingUser) {
        return res.status(400).json({
          error:
            existingUser.email === email
              ? "Email already registered"
              : "Username already taken",
        });
      }

      // Password length validation as per model requirements
      if (password.length < 8 || password.length > 128) {
        return res.status(400).json({
          error: "Invalid password",
          details: {
            message: "Password must be between 8 and 128 characters",
          },
        });
      }

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user record with default privilege
      const newUser = await db.User.create({
        username,
        email,
        password: hashedPassword,
        privilege_id: 3, // Default to subscriber
      });

      // Prepare response (excluding password)
      const userResponse = newUser.toJSON();
      delete userResponse.password;

      res.status(201).json({
        message: "User registered successfully",
        user: userResponse,
      });
    } catch (error) {
      console.error("Error creating user:", error);

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors.map((err) => ({
            field: err.path,
            message: err.message,
          })),
        });
      }

      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          error: "Duplicate entry",
          details: error.errors.map((err) => ({
            field: err.path,
            message: err.message,
          })),
        });
      }

      res.status(500).json({
        error: "Internal Server Error: Unable to create user",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  /**
   * User authentication controller
   */
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Input validation
      if (!email || !password) {
        return res.status(400).json({
          error: "All fields are required",
          details: {
            message: "Email and password are required",
          },
        });
      }

      // Find user and include privilege information
      const user = await db.User.findOne({
        where: { email },
        include: [
          {
            model: db.Privilege,
            as: "privilege",
            attributes: ["name"],
          },
        ],
      });

      if (!user) {
        return res.status(404).json({
          error: "Authentication failed",
          details: {
            message: "Invalid email or password",
          },
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: "Authentication failed",
          details: {
            message: "Invalid email or password",
          },
        });
      }

      // Generate token without expiration
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          privilege_id: user.privilege_id,
        },
        config.jwt.secret
      );
      // Adicione o console.log aqui
      console.log("JWT Secret:", config.jwt.secret);
      console.log("Generated Token:", token);

      // Store token in Redis
      await redisClient.set(`auth_token_${user.id}`, token);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          privilege: {
            name: user.privilege?.name,
          },
        },
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({
        error: "Internal Server Error: Unable to log in",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  /**
   * User logout controller
   */
  logout: async (req, res) => {
    try {
      const userId = req.user.id;
      await redisClient.del(`auth_token_${userId}`);
      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({
        error: "Internal Server Error: Unable to logout",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
};

module.exports = authController;
