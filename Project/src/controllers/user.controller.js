// import { asyncHandler } from "../utils/asyncHandler.js";

import { asyncHandler } from "../utils/asyncHandler.js";

// const registerUser = asyncHandler(async (req, res) => {
//   res.status(200).json({
//     message: "ok",
//   });
// });

const registerUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "Register User endpoint working fine",
  });
});
export { registerUser };
