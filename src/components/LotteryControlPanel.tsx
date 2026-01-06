import { useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DrawModeButton from "@/components/DrawModeButton";
import { useLotterySelectionStore } from "@/stores/useLotterySelectionStore";
import { useLotteryDataStore } from "@/stores/useLotteryDataStore";
import { useLotteryUIStore } from "@/stores/useLotteryUIStore";
import { useLotteryLogic } from "@/hooks/useLotteryLogic";
import { useLotteryRemote } from "@/hooks/useLotteryRemote";
import { GACHA_COLORS } from "@/config/gachaConfig";

export default function LotteryControlPanel() {
  // Get data from stores
  const {
    selectedPrizeId,
    setSelectedPrizeId,
    selectedGroup,
    setSelectedGroup,
    drawMode,
    setDrawMode,
  } = useLotterySelectionStore();

  const {
    prizes,
    isAnimating,
    setIsAnimating,
    winnerRecords,
    skipWinners,
    skipAnimation,
    setSkipAnimation,
    isAnnouncingResults, // 🎯 公布結果狀態
    showWinnerModal, // 🎯 監控彈窗狀態
    setShowWinnerModal, // 🎯 設定彈窗狀態
    addWinnerRecord, // 🎯 新增這個解構
  } = useLotteryDataStore();

  const { openManagement } = useLotteryUIStore();

  // Get lottery logic and validation
  const { validateLottery, participants, drawMultipleWinners } =
    useLotteryLogic();

  // Remote control
  const { sendDrawCommand, sendCloseModalCommand } = useLotteryRemote();

  // 🎯 處理從後台關閉彈窗
  const handleRemoteCloseModal = useCallback(() => {
    sendCloseModalCommand();
    setShowWinnerModal(false);
  }, [sendCloseModalCommand, setShowWinnerModal]);

  // Calculate available groups
  const availableGroups = useMemo(
    () => Array.from(new Set(participants.map((p) => p.group))).sort(),
    [participants]
  );

  // Filter prizes based on selected group
  const filteredPrizes = useMemo(() => {
    if (!selectedGroup) {
      return [];
    }
    return prizes.filter((prize) => {
      // 過濾已刪除的獎項
      if (prize.isDeleted) return false;
      // 只顯示符合選定分組的獎項（group 現在是必填）
      return prize.group === selectedGroup;
    });
  }, [prizes, selectedGroup]);

  // Calculate remaining slots for a prize
  const getPrizeRemainingSlots = useCallback(
    (prizeId: string) => {
      const prize = prizes.find((p) => p.id === prizeId);
      if (!prize) return 0;

      const winnersForThisPrize = winnerRecords.filter((record) => {
        // 如果記錄有 prizeId，只通過 ID 匹配（嚴格匹配）
        if (record.prizeId) {
          return record.prizeId === prizeId;
        }
        // 舊記錄（沒有 prizeId），通過名稱匹配（向後兼容）
        return record.prize === prize.name;
      }).length;

      return Math.max(0, prize.quantity - winnersForThisPrize);
    },
    [prizes, winnerRecords]
  );

  // Handle start lottery
  const handleStartLottery = useCallback(() => {
    // 檢查是否有設定獎品
    if (prizes.length === 0) {
      alert("尚未設定獎項！請先在管理頁面新增獎項。");
      return;
    }

    // 檢查是否選擇了獎項
    if (!selectedPrizeId) {
      alert("請先選擇要抽取的獎項！");
      return;
    }

    const selectedPrize = prizes.find((p) => p.id === selectedPrizeId);
    if (!selectedPrize) {
      alert("選擇的獎項不存在！");
      return;
    }

    // 檢查該獎項是否還有剩餘名額
    const remainingSlots = getPrizeRemainingSlots(selectedPrizeId);
    if (remainingSlots === 0) {
      alert(`「${selectedPrize.name}」已抽完！請選擇其他獎項。`);
      return;
    }

    // 計算本次要抽取的人數
    const drawCount = drawMode === "all" ? remainingSlots : 1;
    console.log(`[Lottery] 準備抽獎: 模式=${drawMode}, 剩餘名額=${remainingSlots}, 預計抽取=${drawCount}`);

    // 檢查是否選擇了分組
    if (!selectedGroup) {
      alert("請選擇要抽獎的分組！");
      return;
    }

    // 檢查是否有足夠的參與者（根據全域設定決定是否排除已中獎者）
    const validation = validateLottery(drawCount, {
      skipWinners: skipWinners,
      selectedGroup: selectedGroup,
    });
    if (!validation.valid) {
      alert(validation.error || "無法進行抽獎，請確認參與者名單。");
      return;
    }

    // 🎲 執行真實抽獎計算 (Backstage Side)
    const lotteryResult = drawMultipleWinners(drawCount, {
      skipWinners: skipWinners,
      selectedGroup: selectedGroup,
    });

    if (
      lotteryResult.error ||
      !lotteryResult.winners ||
      lotteryResult.winners.length === 0
    ) {
      alert(lotteryResult.error || "抽獎失敗");
      return;
    }

    console.log(`[Lottery] 抽獎成功: 實際抽出人數=${lotteryResult.winners.length}`);

    // 準備中獎者資料
    const prizeName = selectedPrize.name;
    const timestamp = Date.now();
    // 🎯 生成本輪唯一的 Session ID
    const drawSessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const ballColor =
      GACHA_COLORS[Math.floor(Math.random() * GACHA_COLORS.length)];
    const { addWinnerRecords, setCurrentDrawSessionId } = useLotteryDataStore.getState();
    
    // 🎯 立即設定當前 Session ID，讓看板能偵測到變化
    setCurrentDrawSessionId(drawSessionId);

    const winners = lotteryResult.winners.map((winner, index) => {
      const recordId = `${winner.id}-${Date.now()}-${index}-${Math.random()
        .toString(36)
        .slice(2, 11)}`;
      return {
        name: winner.name,
        prizeId: selectedPrize.id,
        prize: prizeName,
        participantId: winner.id,
        employeeId: winner.employeeId,
        department: winner.department,
        group: winner.group,
        recordId,
        timestamp,
        drawSessionId,
        isRevealed: skipAnimation, // 🎯 傳遞揭露狀態
      };
    });

    // 1️⃣ 立即批量寫入數據庫 (一次性寫入 30 筆，最穩定)
    addWinnerRecords(winners.map(w => ({
      id: w.participantId,
      name: w.name,
      employeeId: w.employeeId,
      department: w.department,
      group: w.group,
      prizeId: w.prizeId,
      prize: w.prize,
      color: ballColor,
      recordId: w.recordId,
      timestamp: w.timestamp,
      drawSessionId: w.drawSessionId,
      isRevealed: w.isRevealed,
    })));

    // 📡 廣播抽獎指令給前端
    sendDrawCommand(winners, ballColor, skipAnimation);

    // 鎖定後台 UI
    setIsAnimating(true);
  }, [
    prizes,
    selectedPrizeId,
    selectedGroup,
    drawMode,
    skipWinners,
    getPrizeRemainingSlots,
    validateLottery,
    setIsAnimating,
    drawMultipleWinners,
    sendDrawCommand,
    skipAnimation,
  ]);

  // 🎯 當分組改變或獎品抽完時，自動選擇下一個可用的獎項
  useEffect(() => {
    if (!selectedGroup) {
      // 如果沒有選擇分組，清空獎項選擇
      setSelectedPrizeId("");
      return;
    }

    // 檢查當前選擇的獎項是否還在過濾後的列表中
    const isCurrentPrizeValid = filteredPrizes.some(
      (p) => p.id === selectedPrizeId
    );

    // 檢查當前選擇的獎項是否還有剩餘名額
    const currentPrizeRemaining = selectedPrizeId
      ? getPrizeRemainingSlots(selectedPrizeId)
      : 0;

    // 如果當前獎項無效、沒有選擇、或已抽完，則自動選擇下一個有剩餘名額的獎項
    if (
      !isCurrentPrizeValid ||
      !selectedPrizeId ||
      currentPrizeRemaining === 0
    ) {
      const sortedPrizes = [...filteredPrizes].sort(
        (a, b) => b.level - a.level
      );
      const firstAvailable = sortedPrizes.find((prize) => {
        const remaining = getPrizeRemainingSlots(prize.id);
        return remaining > 0;
      });
      if (firstAvailable) {
        setSelectedPrizeId(firstAvailable.id);
      } else {
        setSelectedPrizeId("");
      }
    }
  }, [
    selectedGroup,
    filteredPrizes,
    selectedPrizeId,
    setSelectedPrizeId,
    getPrizeRemainingSlots,
  ]);

  return (
    <div className="max-h-[70vh] xl:max-h-[70vh] bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-50 rounded-lg shadow-[0_8px_30px_rgba(168,85,247,0.2)] border-2 border-amber-400 flex flex-col overflow-y-auto">
      <style jsx global>{`
        @keyframes breathe {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.6);
          }
        }
        .animate-breathe {
          animation: breathe 1.5s infinite ease-in-out !important;
        }
      `}</style>
      {/* 可滾動內容區 */}
      <div className="px-4 py-5 flex flex-col gap-3 overflow-y-auto flex-1 min-h-0">
        {/* 抽獎設定區 */}
        {prizes.length > 0 && (
          <>
            {/* 1️⃣ 分組選擇器（先選擇分組） */}
            {availableGroups.length > 0 && (
              <div>
                <label className="text-base font-bold text-amber-900 flex items-center gap-1.5">
                  分組
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-2 py-2.5 text-sm border-2 border-amber-300 rounded-lg bg-amber-100 text-amber-900 font-medium focus:outline-none focus:ring-3 focus:ring-amber-400/50 focus:border-amber-400 shadow-sm transition-all hover:border-amber-400"
                  disabled={isAnimating}
                >
                  <option value="">請選擇分組</option>
                  {availableGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 2️⃣ 獎項選擇器（根據分組顯示對應獎項） */}
            <div>
              <label className="text-base font-bold text-amber-900 flex items-center gap-1.5">
                獎項
              </label>
              <select
                key={`prize-select-${prizes
                  .map((p) => `${p.id}-${p.name}-${p.quantity}`)
                  .join("-")}`}
                value={selectedPrizeId}
                onChange={(e) => setSelectedPrizeId(e.target.value)}
                className="w-full px-2 py-2.5 text-sm border-2 border-amber-300 rounded-lg bg-amber-100 text-amber-900 font-medium focus:outline-none focus:ring-3 focus:ring-amber-400/50 focus:border-amber-400 shadow-sm transition-all hover:border-amber-400 disabled:bg-amber-50/50 disabled:cursor-not-allowed disabled:border-amber-200"
                disabled={
                  isAnimating || !selectedGroup || filteredPrizes.length === 0
                }
              >
                {!selectedGroup && <option value="">請先選擇分組</option>}
                {selectedGroup && filteredPrizes.length === 0 && (
                  <option value="">此分組沒有可用獎項</option>
                )}
                {selectedGroup &&
                  filteredPrizes.length > 0 &&
                  [...filteredPrizes]
                    .sort((a, b) => b.level - a.level)
                    .map((prize) => {
                      const remaining = getPrizeRemainingSlots(prize.id);
                      return (
                        <option key={prize.id} value={prize.id}>
                          {prize.name} (剩餘 {remaining}/{prize.quantity} 名)
                        </option>
                      );
                    })}
              </select>
            </div>

            {/* 3️⃣ 抽獎模式 */}
            <div>
              <label className="text-base font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                抽獎模式
              </label>
              <div className="flex flex-col md:flex-row gap-2">
                <DrawModeButton
                  isSelected={drawMode === "single"}
                  disabled={isAnimating}
                  onClick={() => setDrawMode("single")}
                >
                  抽一個
                </DrawModeButton>
                <DrawModeButton
                  isSelected={drawMode === "all"}
                  disabled={isAnimating}
                  onClick={() => setDrawMode("all")}
                >
                  抽全部
                </DrawModeButton>
              </div>
            </div>

            {/* 顯示本次將抽取的人數 */}
            {selectedPrizeId && (
              <div
                key={`draw-count-${selectedPrizeId}-${getPrizeRemainingSlots(
                  selectedPrizeId
                )}`}
                className="text-center text-sm text-amber-900 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg px-3 py-2.5 border-2 border-amber-300 shadow-sm"
              >
                <span className="font-medium">本次將抽取：</span>
                <span className="font-black text-rose-500 ml-1 text-base">
                  {drawMode === "all"
                    ? getPrizeRemainingSlots(selectedPrizeId)
                    : getPrizeRemainingSlots(selectedPrizeId) === 0
                    ? 0
                    : 1}{" "}
                  人
                </span>
              </div>
            )}
          </>
        )}

        {/* 抽獎按鈕區 */}
        <div className="flex flex-col gap-3">
          {prizes.length !== 0 && (
            <div className="flex items-center gap-2 px-2">
              <input
                type="checkbox"
                id="skipAnimation"
                checked={skipAnimation}
                onChange={(e) => setSkipAnimation(e.target.checked)}
                disabled={isAnimating}
                className="w-4 h-4 text-emerald-500 border-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label
                htmlFor="skipAnimation"
                className={`text-sm font-medium ${
                  isAnimating
                    ? "text-amber-600 cursor-not-allowed"
                    : "text-amber-900 cursor-pointer"
                }`}
              >
                跳過抽獎動畫
                <span className="hidden lg:inline">（直接顯示結果）</span>
              </label>
            </div>
          )}

          <div>
            <Button
              onClick={handleStartLottery}
              disabled={
                isAnimating ||
                isAnnouncingResults || // 🎯 公布結果時禁用
                showWinnerModal || // 🎯 彈窗顯示時禁用
                prizes.length === 0 ||
                getPrizeRemainingSlots(selectedPrizeId) === 0
              }
              className={`w-full text-lg font-bold py-6 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white border-0 hover:shadow-[0_8px_30px_rgba(16,185,129,0.6)] hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                !(
                  isAnimating ||
                  isAnnouncingResults ||
                  showWinnerModal ||
                  prizes.length === 0 ||
                  getPrizeRemainingSlots(selectedPrizeId) === 0
                )
                  ? "animate-breathe"
                  : ""
              }`}
            >
              <>
                {prizes.length === 0 ? (
                  <div>
                    <span className="hidden sm:inline">請先設定獎項</span>
                    <span className="sm:hidden">開始抽獎</span>
                  </div>
                ) : (
                  <div>開始抽獎</div>
                )}
              </>
            </Button>
          </div>

          {/* 關閉中獎彈窗按鈕 */}
          <div>
            <Button
              onClick={handleRemoteCloseModal}
              disabled={isAnimating}
              className={`w-full text-base font-bold py-6 rounded-lg border-2 transition-all duration-200 ${
                showWinnerModal
                  ? "bg-rose-500 border-rose-600 text-white enabled:hover:bg-rose-600 shadow-[0_4px_15px_rgba(244,63,94,0.4)] enabled:hover:scale-[1.02] enabled:active:scale-95"
                  : "bg-gray-100 border-gray-200 text-gray-400 opacity-60 cursor-not-allowed hover:bg-gray-100"
              }`}
            >
              關閉中獎彈窗
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-2.5">
            {/* 管理按鈕 */}
            <Button
              onClick={openManagement}
              disabled={
                isAnimating ||
                isAnnouncingResults || // 🎯 公布結果時禁用
                showWinnerModal // 🎯 彈窗顯示時禁用
              }
              className="lg:flex-1 text-base font-bold py-6 rounded-lg bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              抽獎設定
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
