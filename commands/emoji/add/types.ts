import { AxiosResponse } from 'axios';

export interface Poll {
  id: number;
  withdrawAmount: number;
  withdrawDuration: number;
  startTime: number;
  endTime: number;
  yesCounter: number;
  noCounter: number;
  totalVoted: number;
}

export interface RewardResponse extends AxiosResponse {
  data: {
    id: string;
    withdrawAmount: number;
    withdrawDuration: number;
    state: number;
    poll?: Poll;
  };
}
