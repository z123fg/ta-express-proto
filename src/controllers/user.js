import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUser, updateICE } from "../services/user.service";
import { config } from "dotenv";
config();
const JWT_KEY = process.env.JWT_KEY;

export const signup = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hash = await bcrypt.hash(password, 10);
        const existUser = await findUser(username);
        if (!!existUser) throw Error("username already exist!");
        const result = await createUser(username, hash);
        res.json({ user: { ...result.generatedMaps[0], username }, message: "sign up successfully!" });
    } catch (err) {
        res.status(401).json({ message: "sign up failed, reason:" + err });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password, ICEOffer ,ICEAnswer} = req.body;
        const user = await findUser(username);
        if (!user) throw Error("couldn't find user, please login");

        const compare = await bcrypt.compare(password, user?.password);
        if (compare) {
            const token = jwt.sign(
                {
                    username: user.username,
                    id: user.id,
                },
                JWT_KEY,
                { expiresIn: "24h" }
            );
            const userInfo = {
                username,
                userId: user.id,
                token,
            };
            await updateICE(user.id, ICEOffer, ICEAnswer);

            res.json({ message: "login successfully!", user: userInfo });
        } else {
            throw Error("password doesn't match");
        }
    } catch (err) {
        res.status(401).json({ message: "failed to login, reason: " + err });
    }
};
