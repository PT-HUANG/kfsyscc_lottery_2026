import { useEffect, useRef } from 'react';
import { getLotteryChannel, LotteryMessage } from '@/utils/lotteryChannel';
import { useLotteryDataStore } from '@/stores/useLotteryDataStore';
import { useLotteryUIStore } from '@/stores/useLotteryUIStore';
import { WinnerInfo } from '@/types/lottery';

export function useLotteryReceiver() {
  const pendingWinnersRef = useRef<WinnerInfo[] | null>(null);
  const pendingBallColorRef = useRef<string>('');
  const pendingSkipAnimationRef = useRef<boolean>(false);

  useEffect(() => {
    const channel = getLotteryChannel();
    if (!channel) return;

    // 🎯 直接從 Store 獲取動作，避免將它們列入依賴項，增加熱更新穩定性
    const {
      setIsAnimating,
      setSkipAnimation,
      setShowWinnerModal,
      setIsAnnouncingResults,
      revealWinnerRecord,
      addWinnerRecords,
      setCurrentDrawSessionId
    } = useLotteryDataStore.getState();

    const {
      setShowWinnerBoard
    } = useLotteryUIStore.getState();

    channel.onmessage = (event: MessageEvent<LotteryMessage>) => {
      const data = event.data;
      
      switch (data.type) {
        case 'START_DRAW':
          pendingWinnersRef.current = data.winners;
          pendingBallColorRef.current = data.ballColor;
          pendingSkipAnimationRef.current = data.skipAnimation;
          
          // 🎯 重要：收到指令後，立即在本地 Store 設定 Session ID 與寫入名單
          // 這樣看板就能立即偵測到數據，不需要等待 localStorage 同步
          if (data.winners.length > 0) {
            // 🐛 修復：確保 sessionId 永遠不會是空字符串，否則看板會無法顯示
            const sessionId = data.winners[0].drawSessionId ||
              `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
            setCurrentDrawSessionId(sessionId);

            // 🔧 優化：使用批量添加方法，避免多次狀態更新，提升性能
            addWinnerRecords(
              data.winners.map(w => ({
                ...w,
                id: w.participantId,
                color: data.ballColor,
                drawSessionId: sessionId, // 🐛 確保每筆記錄都有正確的 sessionId
                isRevealed: data.skipAnimation // 同步後台的揭露狀態
              }))
            );
          }

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
        case 'REVEAL_WINNER':
          revealWinnerRecord(data.recordId);
          break;
        case 'RESET_ANIMATION':
          setIsAnimating(false);
          pendingWinnersRef.current = null;
          break;
        case 'CLOSE_MODAL':
          setShowWinnerModal(false);
          setIsAnimating(false);
          break;
        case 'TOGGLE_WINNER_BOARD':
          setShowWinnerBoard(data.show);
          break;
      }
    };

    return () => {
      channel.close();
    };
  }, []); // 🎯 保持依賴項陣列不變

  return {
    pendingWinnersRef,
    pendingBallColorRef,
    pendingSkipAnimationRef
  };
}
