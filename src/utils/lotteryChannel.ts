import { LotteryMessage } from '@/types/lottery';

export const LOTTERY_CHANNEL_NAME = 'lottery_channel_v1';

export const getLotteryChannel = () => {
  if (typeof window === 'undefined') return null;
  return new BroadcastChannel(LOTTERY_CHANNEL_NAME);
};

export type { LotteryMessage };