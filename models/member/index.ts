export interface IMember extends Document {
  address: string;
  isMember: boolean;
  isManager: boolean;
  token: {
    name: string;
    symbol: string;
    balance: number;
  };
}
