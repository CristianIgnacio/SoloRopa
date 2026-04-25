import mongoose, { model, Schema, Document } from "mongoose"

interface IProductEvent {
  productId: mongoose.Schema.Types.ObjectId
  userId?: mongoose.Schema.Types.ObjectId
  type: "view" | "favorite" | "unfavorite" | "click"
  ip: string
  createdAt: Date
}

const ProductEventSchema = new Schema<IProductEvent>({
  productId : {type : mongoose.Schema.Types.ObjectId, ref:"Product", required : true},
  userId : {type : mongoose.Schema.Types.ObjectId, ref:"User", required : false},
  type : {type : String, required : true, enum:["view", "favorite", "unfavorite", "click"]},
  ip : {type : String, required : true},
}, {
  timestamps:  { createdAt: true, updatedAt: false },
})

ProductEventSchema.set("toJSON", {
  transform: (
    _,
    returnedObject: { id?: string; _id?: mongoose.Types.ObjectId; __v?: number }
  ) => {
    returnedObject.id = returnedObject._id?.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const ProductEventModel = model<IProductEvent>("ProductEvent", ProductEventSchema);

export default ProductEventModel

