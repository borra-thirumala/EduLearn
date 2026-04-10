import jwt from "jsonwebtoken";

export const generateToken = (res, user) => {
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
  httpOnly: true,
  secure: true,        // 🔥 REQUIRED
  sameSite: "none",    // 🔥 REQUIRED
  maxAge: 24 * 60 * 60 * 1000,
});
};













// import jwt from "jsonwebtoken";

// export const generateToken = (res, user, message) => {
//   const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
//     expiresIn: "1d",
//   });

//   return res
//     .status(200)
//     .cookie("token", token, {
//       httpOnly: true,
//       sameSite: "lax",
//       maxAge: 24 * 60 * 60 * 1000, // 1 day
//     }).json({
//         success:true,
//         message,
//         user
//     });
// };