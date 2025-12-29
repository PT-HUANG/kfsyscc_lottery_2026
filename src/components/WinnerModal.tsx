"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Lottie from "lottie-react";
import confettiAnimation from "@/../public/Confetti.json";

interface WinnerInfo {
  name: string;
  prize: string;
  participantId: string;
  employeeId?: string;
  department?: string;
}

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  winners: WinnerInfo[];
}

export default function WinnerModal({
  isOpen,
  onClose,
  winners,
}: WinnerModalProps) {
  const isSingleWinner = winners.length === 1;
  const firstWinner = winners[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={isSingleWinner ? "sm:max-w-[500px] p-8" : "sm:max-w-[700px] p-8 max-h-[80vh] overflow-y-auto"}>
        {/* Lottie Confetti Animation Overlay */}
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          <Lottie
            animationData={confettiAnimation}
            loop={true}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎉 恭喜中獎！🎉
          </DialogTitle>
        </DialogHeader>

        {isSingleWinner ? (
          // 單一中獎者顯示（原有樣式）
          <div className="space-y-6">
            <div className="space-y-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  中獎者
                </p>
                <p className="text-2xl font-bold">{firstWinner.name}</p>
              </div>

              {firstWinner.employeeId && (
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    員工編號
                  </p>
                  <p className="text-lg font-semibold font-mono">
                    {firstWinner.employeeId}
                  </p>
                </div>
              )}

              {firstWinner.department && (
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">
                    部門
                  </p>
                  <p className="text-lg font-semibold">
                    {firstWinner.department}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  獎項
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {firstWinner.prize}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // 多位中獎者顯示（列表樣式）
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-muted-foreground mb-1">
                獎項
              </p>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {firstWinner.prize}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                共 {winners.length} 位中獎者
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        #
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        姓名
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        員工編號
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        部門
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {winners.map((winner, index) => (
                      <tr
                        key={winner.participantId}
                        className="border-t border-gray-200 hover:bg-purple-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                          {winner.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                          {winner.employeeId || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {winner.department || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg py-6"
          >
            確認
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
