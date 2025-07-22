import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { User } from "../Models/user";
import { BadRequestError } from "@heaven-nsoft/common";

export const checkRegisterEmailController = async (
  req: Request,
  res: Response
) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    res.status(409).json({ message: "Bu kullanıcı zaten mevcut" });
    return;
  }

  res.status(200).json({ exists: false });
};

export default checkRegisterEmailController;
