import { useEffect } from 'react';

/**
 * 防止用户在关键操作进行中关闭浏览器或标签页
 * @param isActive - 是否启用防止关闭（例如抽奖进行中）
 * @param message - 自定义警告消息（可选）
 */
export function usePreventClose(isActive: boolean, message?: string) {
  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 根据 HTML5 规范，需要设置 returnValue
      e.preventDefault();
      e.returnValue = message || '抽獎正在進行中，確定要離開嗎？';

      // 某些浏览器需要返回字符串
      return e.returnValue;
    };

    // 监听页面卸载事件
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 监听页面可见性变化（用户切换到其他标签页时给予提示）
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.warn('⚠️ 抽獎正在進行中，確定要離開嗎？');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, message]);
}
