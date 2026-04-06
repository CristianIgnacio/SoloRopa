import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique : true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  avatarUrl: {
    type: String,
  },

  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },

}, {
  timestamps: true, // crea createdAt y updatedAt
});

userSchema.set("toJSON", {
  transform: (_, returnedObject: any) => {
    returnedObject.id = returnedObject._id?.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password;
    delete returnedObject.resetPasswordToken;
    delete returnedObject.resetPasswordExpires;
  },
});

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);

//   next();
// });  

// userSchema.methods.comparePassword = function (candidatePassword : string) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

const UserModel = mongoose.model("User", userSchema);

export default UserModel
