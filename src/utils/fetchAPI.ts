import { boxData } from "@/types/BlindBox";
import { enqueueSnackbar } from "notistack";
import { HistoryRecord } from '../types/History';
import { GiftProps } from "@/types/Gifts";
import { HashkeyObj } from "@/types/Hashkey";

// api.ts
export interface BlindBoxAPIParams {
  action: string;
  key: string;
  name?: string;
  ids?: string[] | boxData[];
}


export interface GiftParams {
  action: string;
  key: string;
  name?: string;
  id?: string
  ids?: string[] | boxData[];
  value?: GiftProps
}

export interface HistoryParams {
  action: string;
  key: string;
  record?: HistoryRecord
}

export interface HashkeyParams {
  action: string;
  key: string;
  record?: HashkeyObj
}

export const fetchBlindBoxAPI = async (
  params: BlindBoxAPIParams
): Promise<any> => {
  try {
    const response = await fetch('/api/blindbox', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    enqueueSnackbar('Error fetching data from the blind box API', {variant: 'error'})
  }
};

export const fetchGiftAPI = async (
  params: GiftParams
): Promise<any> => {
  try {
    const response = await fetch('/api/gift', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    enqueueSnackbar('Error fetching data from the gift API', {variant: 'error'})
  }
};

export const fetchHashkeyAPI = async (
  params: HashkeyParams
): Promise<any> => {
  try {
    const response = await fetch('/api/hash', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    enqueueSnackbar('Error fetching data from the history box API', {variant: 'error'})
  }
};

export const fetchHistoryAPI = async (
  params: HistoryParams
): Promise<any> => {
  try {
    const response = await fetch('/api/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    enqueueSnackbar('Error fetching data from the blind box API', {variant: 'error'})
  }
};
