import client from "../utils/googleClient";

const verifyIdToken = async (idToken: string) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience:
      "946747520040-cktu628bd3tuc9v099pjic72vjd8p8hq.apps.googleusercontent.com",
  });
  const payload = ticket.getPayload();
  console.log(payload, "payload test deneme");
  return payload;
};

export default verifyIdToken;
