export interface WinnerInfo {
  name: string;
  prizeId: string;
  prize: string;
  participantId: string;
  employeeId?: string;
  department?: string;
  group: string;
  // Metadata for sync
  recordId?: string;
  timestamp?: number;
  drawSessionId?: string;
}

export type LotteryMessage =
  | { type: 'START_DRAW'; winners: WinnerInfo[]; ballColor: string; skipAnimation: boolean }
  | { type: 'SYNC_ANIMATION'; isAnimating: boolean }
  | { type: 'SYNC_ANNOUNCING'; isAnnouncing: boolean }
  | { type: 'SYNC_WINNER_MODAL'; show: boolean }
  | { type: 'RESET_ANIMATION' }
  | { type: 'CLOSE_MODAL' };
