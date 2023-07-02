import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUser } from "../services/user.service";

const JWT_KEY = process.env.JWT_KEY

export const signup = async (req, res) => {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const result = await createUser( username,  hash );
    res.json({...result, message:"sign up successfully!"});
};

export const login = async (req, res) => {
    const { username, password } = req.body;
    const user = await findUser(username).catch(err=>{
        console.log("couldn't find user");
        res.status(401).json({
            message:"couldn't find user!"
        })
    });
    const compare = bcrypt.compare(password, user.password);
    if (compare) {
        const token = jwt.sign(
            {
                username: user.username,
                id: user.id,
            },
            JWT_KEY,
            { expiresIn: "24h" }
        );
        res.json({message:"login successfully!", token})
    } else {
        res.status(401).json({
            message:"password doesn't match!"
        })
    }
};
