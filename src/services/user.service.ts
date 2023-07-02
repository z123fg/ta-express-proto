import { myDataSource } from "../db/db-resource";
import { User } from "../models/user.entities";


export const createUser = async (userInfo:{userName: string, ICE: string}) => {
  const {userName, ICE} = userInfo
  const userRepository = myDataSource.getRepository(User);
  const user =  userRepository.create(userInfo);
  return userRepository.insert(user);

}