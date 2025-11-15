// 使用IIFE包装避免全局变量污染
(function() {
    // 关闭模态框
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            
            // 如果是音乐或视频播放器，暂停播放
            if (modalId === 'music-modal') {
                const audioPlayer = document.getElementById('audio-player');
                if (audioPlayer) {
                    audioPlayer.pause();
                }
            } else if (modalId === 'video-modal') {
                const videoPlayer = document.getElementById('video-player');
                if (videoPlayer) {
                    videoPlayer.pause();
                }
            }
        }
    }

    // 格式化日期
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // 防抖函数
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // 节流函数
    function throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 深拷贝对象
    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => deepClone(item));
        }
        
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    // 将工具函数添加到全局命名空间
    window.App = window.App || {};
    window.App.utils = {
        closeModal,
        formatDate,
        debounce,
        throttle,
        deepClone
    };
})();