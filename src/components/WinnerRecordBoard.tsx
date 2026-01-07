"use client";

import { useLotteryDataStore } from "@/stores/useLotteryDataStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { useMemo } from "react";
import classicStyles from "@/styles/themes/classic.module.css";
import modernStyles from "@/styles/themes/modern.module.css";
import elegantStyles from "@/styles/themes/elegant.module.css";
import pastelStyles from "@/styles/themes/pastel.module.css";

const themeStylesMap = {
  classic: classicStyles,
  modern: modernStyles,
  elegant: elegantStyles,
  pastel: pastelStyles,
};

export default function WinnerRecordBoard() {
  const winnerRecords = useLotteryDataStore((state) => state.winnerRecords);
  const prizes = useLotteryDataStore((state) => state.prizes);
  const currentDrawSessionId = useLotteryDataStore(
    (state) => state.currentDrawSessionId
  );
  const currentTheme = useThemeStore((state) => state.currentTheme);

  // 根據當前主題選擇對應的樣式
  const styles = themeStylesMap[currentTheme];

  // 🎯 只顯示本輪中獎者（根據 drawSessionId 過濾）
  const latestRoundRecords = useMemo(() => {
    if (!currentDrawSessionId) {
      console.log("[Board] No currentDrawSessionId, waiting...");
      return [];
    }
    const filtered = winnerRecords.filter(
      (record) => record.drawSessionId === currentDrawSessionId
    );
    console.log(`[Board] Session: ${currentDrawSessionId}, Found records: ${filtered.length} / Total: ${winnerRecords.length}`);
    return filtered;
  }, [winnerRecords, currentDrawSessionId]);

  // 🎯 僅顯示已揭露的紀錄，並按時間戳升序排列後反轉（最晚中獎的在最上面）
  const revealedRecords = useMemo(() => {
    const revealed = latestRoundRecords.filter((r) => r.isRevealed !== false);
    // 按時間戳升序排列，然後反轉，讓最晚中獎的顯示在最上方
    revealed.sort((a, b) => a.timestamp - b.timestamp);
    if (latestRoundRecords.length > 0) {
      console.log(`[Board] Revealed: ${revealed.length} / ${latestRoundRecords.length}`);
    }
    return revealed.reverse();
  }, [latestRoundRecords]);

  // 🎯 取得最新時間戳，判斷記錄是否為新加入的
  const latestTimestamp = useMemo(() => {
    if (revealedRecords.length === 0) return 0;
    return Math.max(...revealedRecords.map((r) => r.timestamp));
  }, [revealedRecords]);

  const isRecordNew = (timestamp: number) => {
    // 與最新記錄的時間差小於 800ms 視為新記錄
    return latestTimestamp - timestamp < 800;
  };

  // 🎯 只要本輪有紀錄就顯示看板（外框），即便還沒揭露任何人
  if (latestRoundRecords.length === 0) {
    return null;
  }

  // 取得獎項名稱和分組（假設同一輪都是同一個獎項和分組）
  const firstRecord = latestRoundRecords[0];
  const prize = firstRecord?.prizeId
    ? prizes.find((p) => p.id === firstRecord.prizeId)
    : null;
  const currentPrize = prize?.name || firstRecord?.prize || "";
  const currentGroup = firstRecord?.group || "";

  return (
    <div className={`${styles.board} rounded-lg overflow-hidden`}>
      {/* 標題區域 */}
      <div className={styles.header}>
        {/* 次要標題 */}
        <div className={styles.subtitle}>
          本輪中獎
        </div>

        {/* 獎項名稱 - 主視覺焦點 */}
        <div className="flex justify-center">
          <h2 className={styles.prizeTitle}>
            {currentPrize}
          </h2>
        </div>

        {/* 輔助資訊列 */}
        <div className={styles.info}>
          {currentGroup && (
            <div className="inline-flex items-center gap-1.5 sm:gap-2">
              <span className="font-medium" style={{ color: 'inherit' }}>組別</span>
              <div className={styles.groupBadge}>
                {currentGroup}
              </div>
            </div>
          )}
          <div className="inline-flex items-center gap-1 sm:gap-1.5" style={{ color: 'inherit' }}>
            <span className="font-medium">共</span>
            <span className="font-bold" style={{
              color: currentTheme === 'classic' ? '#fbbf24' :
                     currentTheme === 'modern' ? '#ffffff' :
                     currentTheme === 'pastel' ? '#d4876f' :
                     'rgb(234, 179, 8)'
            }}>
              {revealedRecords.length} / {latestRoundRecords.length}
            </span>
            <span className="font-medium">位中獎</span>
          </div>
        </div>
      </div>

      {/* 記錄列表 */}
      <div className={styles.recordList}>
        {revealedRecords.length === 0 && (
          <div className={styles.emptyState}>
            準備揭曉...
          </div>
        )}
        {revealedRecords.map((record, index) => {
          const isNew = isRecordNew(record.timestamp);
          return (
            <div
              key={record.recordId}
              className={`${styles.recordItem} ${isNew ? styles.animateEntry : ""} rounded-lg`}
            >
              <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
                {/* 序號 */}
                <div className={styles.badge}>
                  <div className={styles.badgeCircle}>
                    <span className={styles.badgeText}>
                      {String(revealedRecords.length - index).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* 中獎者資訊 */}
                <div className={styles.winnerInfo}>
                  {/* 姓名 */}
                  <div className={styles.winnerName}>
                    {record.name}
                  </div>

                  {/* 標籤 */}
                  <div className={styles.tags}>
                    {record.employeeId && (
                      <span className={styles.tag}>
                        {record.employeeId}
                      </span>
                    )}
                    {record.department && (
                      <span className={styles.tag}>
                        {record.department}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
