/* eslint-disable no-useless-escape */

export const walletRegex = /^0x[a-fA-F0-9]{40}$/;
export const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
export const secret = process.env.SECRET || 'fallbackstring';
