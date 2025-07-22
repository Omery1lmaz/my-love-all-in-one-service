import jwt from "jsonwebtoken";

const maxAge = 3 * 24 * 60 * 60;

export const createToken = (
  id: string,
  partnerId: string | undefined | null
) => {
  console.log(process.env.SECRET_KEY, "secret key test deneme")
  return jwt.sign(
    { id, partnerId: partnerId },
    process.env.SECRET_KEY as string,
    {
      expiresIn: maxAge,
    }
  );
};

export const createResetPasswordToken = (jwtInformation: any) => {
  return jwt.sign(
    jwtInformation,
    process.env.RESET_PASSWORD_SECRET_KEY as string,
    {
      expiresIn: "15m",
    }
  );
};
