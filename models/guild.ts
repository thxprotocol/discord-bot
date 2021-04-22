import mongoose, { Document, Schema } from 'mongoose';

const GuildSchema: Schema = new Schema({
  id: { type: String, required: true },
  client_id: { type: String },
  client_secret: { type: String },
  admin_roles: { type: [{ type: String }] }
});

export default mongoose.model<IGuild>('Guilds', GuildSchema);

export interface IGuild extends Document {
  id: string;
  client_id: string;
  client_secret: string;
  admin_roles: mongoose.Types.Array<string>;
}
