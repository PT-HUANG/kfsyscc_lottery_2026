import { useEffect, useState, useRef } from 'react';
import { getLotteryChannel, LotteryMessage } from '@/utils/lotteryChannel';
import { useLotteryDataStore } from '@/stores/useLotteryDataStore';
import { WinnerInfo } from '@/types/lottery';

export function useLotteryReceiver() {
  const setIsAnimating = useLotteryDataStore((state) => state.setIsAnimating);
  const setSkipAnimation = useLotteryDataStore((state) => state.setSkipAnimation);
  const setShowWinnerModal = useLotteryDataStore((state) => state.setShowWinnerModal);
  const setIsAnnouncingResults = useLotteryDataStore((state) => state.setIsAnnouncingResults);
  const pendingWinnersRef = useRef<WinnerInfo[] | null>(null);
  const pendingBallColorRef = useRef<string>('');
  const pendingSkipAnimationRef = useRef<boolean>(false);

  useEffect(() => {
    const channel = getLotteryChannel();
    if (!channel) return;

    channel.onmessage = (event: MessageEvent<LotteryMessage>) => {
      const data = event.data;
      
      switch (data.type) {
        case 'START_DRAW':
          pendingWinnersRef.current = data.winners;
          pendingBallColorRef.current = data.ballColor;
          pendingSkipAnimationRef.current = data.skipAnimation;
          // Sync skipAnimation state immediately
          setSkipAnimation(data.skipAnimation);
          setIsAnimating(true);
          break;
        case 'SYNC_ANIMATION':
          setIsAnimating(data.isAnimating);
          break;
        case 'SYNC_ANNOUNCING':
          setIsAnnouncingResults(data.isAnnouncing);
          break;
        case 'SYNC_WINNER_MODAL':
          setShowWinnerModal(data.show);
          break;
        case 'RESET_ANIMATION':
          setIsAnimating(false);
          pendingWinnersRef.current = null;
          break;
        case 'CLOSE_MODAL':
          setShowWinnerModal(false);
          setIsAnimating(false);
          break;
      }
    };

    return () => {
      channel.close();
    };
  }, [setIsAnimating, setSkipAnimation]);

  return {
    pendingWinnersRef,
    pendingBallColorRef,
    pendingSkipAnimationRef
  };
}
