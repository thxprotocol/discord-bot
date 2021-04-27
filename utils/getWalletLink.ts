const getWalletLink = (contractAddress: string) => {
  return `https://wallet.thx.network/pools/${contractAddress}`;
};

export default getWalletLink;
