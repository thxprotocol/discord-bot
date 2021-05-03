export interface IMember extends Document {
  address: string;
  isMember: boolean;
  isManager: boolean;
  balance: {
    name: string;
    symbol: string;
    amount: number;
  };
}
