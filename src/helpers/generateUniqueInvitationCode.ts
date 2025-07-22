import { User } from "../Models/user";

const generateUniqueInvitationCode = async (): Promise<number> => {
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000);
    const existingUser = await User.findOne({ partnerInvitationCode: code });
    if (!existingUser) {
      isUnique = true;
    }
  }
  console.log(code, "user code is  ");
  return code as number;
};

export default generateUniqueInvitationCode;
