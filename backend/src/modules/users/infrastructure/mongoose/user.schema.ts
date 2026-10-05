import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';

@Schema({ collection: 'users', timestamps: true, versionKey: false })
export class UserDocumentModel {
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, trim: true })
  name: string;

  /** `select: false` - hashes are never loaded unless a query explicitly asks for them. */
  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ type: String, default: null, select: false })
  refreshTokenHash: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<UserDocumentModel>;
export const UserSchema = SchemaFactory.createForClass(UserDocumentModel);
