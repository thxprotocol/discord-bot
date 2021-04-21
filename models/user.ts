import mongoose, { Document, Schema } from 'mongoose';

const UserSchema: Schema = new Schema({
  uuid: { type: String, required: true, unique: true },
  public_address: { type: String }
});

export default mongoose.model<IUser>('User', UserSchema);

export interface IUser extends Document {
  uuid: string;
  public_address: string;
}
