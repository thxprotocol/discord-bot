import mongoose, { Document, Schema } from 'mongoose';
import { IGuild } from '../guild';

const ChannelSchema: Schema = new Schema({
  id: { type: String, required: true },
  pool_address: { type: String, required: true },
  members: { type: [String] },
  guild: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guilds'
  }
});

export default mongoose.model<IChannel>('Channels', ChannelSchema);

export interface IChannel extends Document {
  id: string;
  pool_address: string;
  members: string[];
  guild: IGuild;
}
