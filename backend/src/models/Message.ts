import mongoose, { Document, Schema } from "mongoose";

export enum MessageRole {
  USER = "user",
  AI = "assistant",
}

export interface IMessage extends Document {
  sessionId: string;
  role: MessageRole;
  content: string;
  modelUsed?: string;
  isExcluded?: boolean;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(MessageRole),
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    modelUsed: { type: String },
    isExcluded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMessage>("Message", MessageSchema);
