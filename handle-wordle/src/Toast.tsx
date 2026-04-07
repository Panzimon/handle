import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'error' | 'warning' | 'success';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  // 固定显示时间为 5 秒
  const duration = 5000;

  useEffect(() => {
    // 组件挂载时设置定时器
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]); // 只依赖 onClose 和 duration

  const getTypeStyles = () => {
    if (type === 'error') {
      return {
        backgroundColor: '#fef2f2',
        borderColor: '#fca5a5',
        textColor: '#b91c1c',
        icon: '❌',
        title: '错误',
      };
    } else if (type === 'success') {
      return {
        backgroundColor: '#f0fdf4',
        borderColor: '#bbf7d0',
        textColor: '#15803d',
        icon: '✅',
        title: '成功',
      };
    } else {
      return {
        backgroundColor: '#fffbeb',
        borderColor: '#fcd34d',
        textColor: '#92400e',
        icon: '⚠️',
        title: '警告',
      };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className="fixed top-4 right-4 z-50 max-w-xs w-full border rounded-lg shadow-lg transform transition-all duration-300 ease-in-out translate-y-0 opacity-100"
      style={{
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        color: styles.textColor,
      }}
    >
      <div className="p-4 flex items-start gap-3">
        <div className="text-xl flex-shrink-0">{styles.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: styles.textColor }}>
            {styles.title}
          </p>
          <p className="text-sm mt-1" style={{ color: styles.textColor }}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-sm flex-shrink-0 hover:underline"
          style={{ color: styles.textColor }}
        >
          关闭
        </button>
      </div>
    </div>
  );
};

export default Toast;