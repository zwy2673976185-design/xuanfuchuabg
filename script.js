// 悬浮窗插件核心逻辑 - 修复版
function initFloatingWindow() {
    console.log('🚀 初始化悬浮窗插件...');
    
    // 防止重复初始化
    if (window.floatingWindowInjected) {
        console.log('⚠️ 插件已初始化，跳过');
        return;
    }
    window.floatingWindowInjected = true;
    
    // 创建插件HTML结构
    const pluginHTML = `
        <!-- 弹窗通知 -->
        <div id="notificationPopup" class="notification-popup"></div>
        
        <!-- 悬浮按钮 -->
        <button class="float-btn" id="floatBtn">⚙️</button>
        
        <!-- 悬浮窗口 -->
        <div class="float-window" id="floatWindow">
            <div class="window-header" id="windowHeader">
                功能面板
                <button class="modal-back" id="modalBack">返回</button>
            </div>
            
            <!-- 主菜单 -->
            <div class="func-buttons" id="funcButtons">
                <button class="func-btn" data-panel="panelMy">
                    <span>我的账户</span>
                    <span>👤</span>
                </button>
                <button class="func-btn" data-panel="panelNotice">
                    <span>系统公告</span>
                    <span>📢</span>
                </button>
                <button class="func-btn" data-panel="panelContact">
                    <span>联系支持</span>
                    <span>📞</span>
                </button>
                <button class="func-btn" data-panel="panelSetting">
                    <span>系统设置</span>
                    <span>⚙️</span>
                </button>
            </div>
            
            <!-- 我的账户面板 -->
            <div class="content-panel" id="panelMy">
                <div style="padding: 20px;">
                    <h3 style="margin-bottom: 20px; color: #3b82f6;">我的账户</h3>
                    
                    <!-- 登录表单 -->
                    <div id="loginForm">
                        <div class="form-group">
                            <label>用户名</label>
                            <input type="text" id="username" placeholder="输入用户名">
                        </div>
                        <div class="form-group">
                            <label>密码</label>
                            <input type="password" id="password" placeholder="输入密码">
                        </div>
                        <button class="auth-btn" id="loginBtn">登录</button>
                        <div style="text-align: center; margin-top: 15px; font-size: 12px; color: #64748b;">
                            演示账号: admin / 123456
                        </div>
                    </div>
                    
                    <!-- 用户信息 -->
                    <div id="userInfo" style="display: none; text-align: center;">
                        <div class="user-avatar">👤</div>
                        <h3 id="displayName">用户</h3>
                        <p id="userEmail">user@example.com</p>
                        <button class="auth-btn" id="logoutBtn" style="background: #ef4444;">退出登录</button>
                    </div>
                </div>
            </div>
            
            <!-- 公告面板 -->
            <div class="content-panel" id="panelNotice">
                <div style="padding: 20px;">
                    <h3 style="margin-bottom: 20px; color: #3b82f6;">系统公告</h3>
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h4 style="margin: 0 0 10px 0; color: #1e293b;">🎉 悬浮窗插件上线</h4>
                        <p style="margin: 0; font-size: 13px; color: #475569;">欢迎使用悬浮窗插件！这是一个功能完善的悬浮窗系统。</p>
                    </div>
                </div>
            </div>
            
            <!-- 联系面板 -->
            <div class="content-panel" id="panelContact">
                <div style="padding: 20px; text-align: center;">
                    <h3 style="margin-bottom: 20px; color: #3b82f6;">联系支持</h3>
                    <p style="color: #64748b; margin-bottom: 20px;">如有问题，请联系我们</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                        <p style="margin: 0; font-size: 13px; color: #3b82f6;">📧 support@example.com</p>
                    </div>
                </div>
            </div>
            
            <!-- 设置面板 -->
            <div class="content-panel" id="panelSetting">
                <div style="padding: 20px;">
                    <h3 style="margin-bottom: 20px; color: #3b82f6;">系统设置</h3>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; color: #475569; font-size: 13px;">位置记忆</label>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" id="positionMemory" checked>
                            <label for="positionMemory" style="font-size: 12px; color: #64748b;">记住窗口位置</label>
                        </div>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 8px; color: #475569; font-size: 13px;">自动登录</label>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" id="autoLogin">
                            <label for="autoLogin" style="font-size: 12px; color: #64748b;">下次自动登录</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 插入到页面
    const container = document.getElementById('floating-window-container') || document.body;
    container.insertAdjacentHTML('beforeend', pluginHTML);
    
    // 获取DOM元素
    const floatBtn = document.getElementById('floatBtn');
    const floatWindow = document.getElementById('floatWindow');
    const modalBack = document.getElementById('modalBack');
    const funcButtons = document.getElementById('funcButtons');
    const windowHeader = document.getElementById('windowHeader');
    const notificationPopup = document.getElementById('notificationPopup');
    
    // 状态变量
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let currentPosition = { x: 0, y: 0 };
    
    // 初始化位置
    function initPosition() {
        const savedPos = localStorage.getItem('floatWindowPos');
        if (savedPos) {
            currentPosition = JSON.parse(savedPos);
        } else {
            // 第一次居中显示
            currentPosition = {
                x: (window.innerWidth - 320) / 2,
                y: (window.innerHeight - 380) / 2
            };
        }
        
        floatWindow.style.left = currentPosition.x + 'px';
        floatWindow.style.top = currentPosition.y + 'px';
    }
    
    // 显示通知
    function showNotification(message, type = 'success') {
        notificationPopup.textContent = message;
        notificationPopup.className = `notification-popup notification-${type}`;
        notificationPopup.style.display = 'block';
        
        setTimeout(() => {
            notificationPopup.style.display = 'none';
        }, 3000);
    }
    
    // 切换悬浮窗显示/隐藏
    function toggleFloatWindow() {
        console.log('🎯 切换悬浮窗状态');
        
        if (floatWindow.style.display === 'block') {
            // 隐藏窗口
            floatWindow.style.display = 'none';
            floatWindow.classList.remove('active');
        } else {
            // 显示窗口
            initPosition();
            floatWindow.style.display = 'block';
            floatWindow.classList.add('active');
            showNotification('悬浮窗已打开', 'success');
        }
    }
    
    // 切换面板
    function switchPanel(panelId) {
        console.log('📱 切换面板:', panelId);
        
        // 隐藏所有面板
        document.querySelectorAll('.content-panel').forEach(panel => {
            panel.style.display = 'none';
            panel.classList.remove('active');
        });
        
        // 隐藏主菜单，显示返回按钮
        funcButtons.style.display = 'none';
        modalBack.style.display = 'block';
        
        // 显示目标面板
        const targetPanel = document.getElementById(panelId);
        if (targetPanel) {
            targetPanel.style.display = 'block';
            targetPanel.classList.add('active');
        }
    }
    
    // 返回主菜单
    function backToMain() {
        // 隐藏所有面板
        document.querySelectorAll('.content-panel').forEach(panel => {
            panel.style.display = 'none';
            panel.classList.remove('active');
        });
        
        // 显示主菜单，隐藏返回按钮
        funcButtons.style.display = 'flex';
        modalBack.style.display = 'none';
    }
    
    // 拖拽功能
    function startDrag(e) {
        console.log('🖱️ 开始拖拽');
        isDragging = true;
        
        // 计算偏移量
        const rect = floatWindow.getBoundingClientRect();
        dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        e.preventDefault();
    }
    
    function doDrag(e) {
        if (!isDragging) return;
        
        // 计算新位置
        currentPosition = {
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y
        };
        
        // 限制在屏幕内
        currentPosition.x = Math.max(0, Math.min(currentPosition.x, window.innerWidth - 320));
        currentPosition.y = Math.max(0, Math.min(currentPosition.y, window.innerHeight - 380));
        
        // 应用新位置
        floatWindow.style.left = currentPosition.x + 'px';
        floatWindow.style.top = currentPosition.y + 'px';
    }
    
    function stopDrag() {
        console.log('🖱️ 停止拖拽');
        if (isDragging) {
            isDragging = false;
            // 保存位置
            localStorage.setItem('floatWindowPos', JSON.stringify(currentPosition));
        }
    }
    
    // 绑定事件
    function bindEvents() {
        console.log('🔗 绑定事件监听器');
        
        // 悬浮按钮点击
        floatBtn.addEventListener('click', toggleFloatWindow);
        
        // 功能按钮点击
        document.querySelectorAll('.func-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const panelId = e.currentTarget.getAttribute('data-panel');
                if (panelId) switchPanel(panelId);
            });
        });
        
        // 返回按钮
        modalBack.addEventListener('click', backToMain);
        
        // 窗口拖拽
        windowHeader.addEventListener('mousedown', startDrag);
        windowHeader.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                startDrag(e.touches[0]);
            }
        });
        
        // 全局拖拽
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                doDrag(e.touches[0]);
            }
        });
        document.addEventListener('touchend', stopDrag);
        
        // 登录功能
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const loginForm = document.getElementById('loginForm');
        const userInfo = document.getElementById('userInfo');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                if (username && password) {
                    // 模拟登录成功
                    document.getElementById('displayName').textContent = username;
                    loginForm.style.display = 'none';
                    userInfo.style.display = 'block';
                    showNotification('登录成功！', 'success');
                } else {
                    showNotification('请输入用户名和密码', 'error');
                }
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                loginForm.style.display = 'block';
                userInfo.style.display = 'none';
                showNotification('已退出登录', 'success');
            });
        }
        
        // 阻止窗口内部点击事件冒泡
        floatWindow.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // 初始化
    function init() {
        console.log('🎯 开始初始化插件');
        initPosition();
        bindEvents();
        console.log('✅ 插件初始化完成');
    }
    
    // 执行初始化
    init();
}

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof initFloatingWindow === 'function' && !window.floatingWindowInjected) {
            initFloatingWindow();
        }
    });
} else {
    if (typeof initFloatingWindow === 'function' && !window.floatingWindowInjected) {
        initFloatingWindow();
    }
}
