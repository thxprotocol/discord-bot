import mongoose, { Document, Schema } from 'mongoose';
import { IChannel } from './channel';

const ReactionSchema: Schema = new Schema({
  reaction_id: { type: String, required: true },
  reward_id: { type: String, required: true },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channels'
  }
});

export default mongoose.model<IReaction>('Reactions', ReactionSchema);

export interface IReaction extends Document {
  reaction_id: string;
  reward_id: string;
  channel: IChannel;
}
