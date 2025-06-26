import mongoose, { Document, Model, Types } from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

export interface ITransaction extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new mongoose.Schema<ITransaction>(
  {
    sender: {
      type: ObjectId,
      required: true,
    },
    receiver: {
      type: ObjectId,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    collection: "Transaction",
  }
);

export const TransactionModel: Model<ITransaction> = mongoose.model(
  "Transaction",
  TransactionSchema
);
