import { useEffect, useRef, useCallback } from 'react';
import { getLotteryChannel, LotteryMessage } from '@/utils/lotteryChannel';
import { WinnerInfo } from '@/types/lottery';

export function useLotteryRemote() {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = getLotteryChannel();
    return () => {
      channelRef.current?.close();
    };
  }, []);

  const sendDrawCommand = useCallback((winners: WinnerInfo[], ballColor: string, skipAnimation: boolean) => {
    channelRef.current?.postMessage({
      type: 'START_DRAW',
      winners,
      ballColor,
      skipAnimation,
    } as LotteryMessage);
  }, []);

  const syncAnimationState = useCallback((isAnimating: boolean) => {
    channelRef.current?.postMessage({
      type: 'SYNC_ANIMATION',
      isAnimating,
    } as LotteryMessage);
  }, []);

  const sendCloseModalCommand = useCallback(() => {
    channelRef.current?.postMessage({
      type: 'CLOSE_MODAL',
    } as LotteryMessage);
  }, []);

  const syncWinnerModalState = useCallback((show: boolean) => {
    channelRef.current?.postMessage({
      type: 'SYNC_WINNER_MODAL',
      show,
    } as LotteryMessage);
  }, []);

  const syncAnnouncingState = useCallback((isAnnouncing: boolean) => {
    channelRef.current?.postMessage({
      type: 'SYNC_ANNOUNCING',
      isAnnouncing,
    } as LotteryMessage);
  }, []);

  const syncRevealWinner = useCallback((recordId: string) => {
    channelRef.current?.postMessage({
      type: 'REVEAL_WINNER',
      recordId,
    } as LotteryMessage);
  }, []);

  return {
    sendDrawCommand,
    syncAnimationState,
    sendCloseModalCommand,
    syncWinnerModalState,
    syncAnnouncingState,
    syncRevealWinner
  };
}
