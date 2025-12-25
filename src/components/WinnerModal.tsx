"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  winnerInfo: {
    name: string;
    prize: string;
    id: string;
  };
}

export default function WinnerModal({
  isOpen,
  onClose,
  winnerInfo,
}: WinnerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-8">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎉 恭喜中獎！🎉
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 中獎人資訊 */}
          <div className="space-y-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">
                中獎者
              </p>
              <p className="text-2xl font-bold">{winnerInfo.name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">
                獎項
              </p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {winnerInfo.prize}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">
                編號
              </p>
              <p className="text-lg text-muted-foreground font-mono">
                {winnerInfo.id}
              </p>
            </div>
          </div>
        </div>

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
