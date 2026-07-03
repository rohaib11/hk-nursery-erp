import pool from '../db/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 🔐 1. INITIALIZE DEFAULT ADMIN (Runs if no users exist)
export const seedAdminUser = async () => {
    try {
        const result = await pool.query("SELECT COUNT(*) as count FROM users");
        const userCount = parseInt(result.rows[0].count, 10);
        
        if (userCount === 0) {
            console.log("👤 No users found. Creating default Owner account...");
            const hashedPw = await bcrypt.hash('admin123', 10);
            const hashedAns = await bcrypt.hash('nursery', 10);
            
            await pool.query(`
                INSERT INTO users (username, password_hash, full_name, role, security_question, security_answer) 
                VALUES ($1, $2, $3, $4, $5, $6)
            `, ['admin', hashedPw, 'System Owner', 'owner', 'What is your favorite word?', hashedAns]);
            
            console.log("✅ Default Owner created (Username: admin, Password: admin123)");
        }
    } catch (err) {
        console.error("❌ Failed to seed admin user:", err.message);
    }
};

// 🔐 2. LOGIN
export const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = result.rows[0];
        
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.is_active === false || user.is_active === 0) return res.status(403).json({ error: "Account disabled" });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        // Generate Token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({ success: true, token, user: { username: user.username, role: user.role, name: user.full_name } });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Login process failed" });
    }
};

// 🔐 3. GET SECURITY QUESTION (Step 1 of Password Reset)
export const getSecurityQuestion = async (req, res) => {
    const { username } = req.params;
    try {
        const result = await pool.query("SELECT security_question FROM users WHERE username = $1", [username]);
        const user = result.rows[0];
        
        if (!user) return res.status(404).json({ error: "User not found" });
        if (!user.security_question) return res.status(400).json({ error: "No security question set for this user" });

        res.json({ question: user.security_question });
    } catch (err) {
        console.error("Security question error:", err);
        res.status(500).json({ error: "Failed to fetch security question" });
    }
};

// 🔐 4. RESET PASSWORD (Step 2 of Password Reset)
export const resetPassword = async (req, res) => {
    const { username, answer, newPassword } = req.body;
    try {
        const result = await pool.query("SELECT id, security_answer FROM users WHERE username = $1", [username]);
        const user = result.rows[0];
        
        if (!user) return res.status(404).json({ error: "User not found" });

        const isAnswerCorrect = await bcrypt.compare(answer.toLowerCase().trim(), user.security_answer);
        if (!isAnswerCorrect) return res.status(401).json({ error: "Incorrect security answer" });

        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHashedPassword, user.id]);

        res.json({ success: true, message: "Password updated successfully. You can now log in." });
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ error: "Failed to reset password" });
    }
};

// 🔐 5. GET CURRENT USER PROFILE
export const getMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            "SELECT id, username, full_name, role, security_question, created_at FROM users WHERE id = $1",
            [userId]
        );
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ success: true, user });
    } catch (err) {
        console.error("Get profile error:", err);
        res.status(500).json({ error: "Failed to fetch profile." });
    }
};

// 🔐 6. UPDATE PROFILE (full_name, username, security_question, security_answer)
export const updateMe = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, username, security_question, security_answer } = req.body;

        // Check if username is already taken by another user
        if (username) {
            const existing = await pool.query("SELECT id FROM users WHERE username = $1 AND id != $2", [username, userId]);
            if (existing.rows.length > 0) {
                return res.status(400).json({ error: "Username already taken." });
            }
        }

        // Build dynamic update
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (full_name !== undefined) {
            updates.push(`full_name = $${paramIndex++}`);
            values.push(full_name);
        }
        if (username !== undefined) {
            updates.push(`username = $${paramIndex++}`);
            values.push(username);
        }
        if (security_question !== undefined) {
            updates.push(`security_question = $${paramIndex++}`);
            values.push(security_question);
        }
        if (security_answer !== undefined) {
            // Hash the new answer
            const hashedAns = await bcrypt.hash(security_answer.toLowerCase().trim(), 10);
            updates.push(`security_answer = $${paramIndex++}`);
            values.push(hashedAns);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: "No fields to update." });
        }

        values.push(userId);
        await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
            values
        );

        // Fetch updated user
        const updated = await pool.query(
            "SELECT id, username, full_name, role, security_question FROM users WHERE id = $1",
            [userId]
        );

        res.json({ success: true, user: updated.rows[0] });
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ error: "Failed to update profile." });
    }
};

// 🔐 7. CHANGE PASSWORD (while logged in)
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ error: "Current and new password are required." });
        }

        // Get current user's password hash
        const result = await pool.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: "User not found." });

        // Verify current password
        const isMatch = await bcrypt.compare(current_password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: "Current password is incorrect." });

        // Hash new password and update
        const newHashed = await bcrypt.hash(new_password, 10);
        await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHashed, userId]);

        res.json({ success: true, message: "Password changed successfully." });
    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ error: "Failed to change password." });
    }
};