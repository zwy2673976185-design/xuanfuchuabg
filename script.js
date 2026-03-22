/**
 * 悬浮窗插件 - 核心JavaScript逻辑 v2.1.0
 * 功能: 可拖拽悬浮窗、登录注册系统、智能通知、位置记忆
 * 使用: 只需引入此文件，插件会自动初始化
 */

// 防止重复注入
if (window.floatingWindowInjected) {
    console.warn('悬浮窗插件已初始化，跳过重复注入');
} else {
    window.floatingWindowInjected = true;
    
    // 等待DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFloatingWindow);
    } else {
        initFloatingWindow();
    }
}

function initFloatingWindow() {
    console.log('🚀 初始化悬浮窗插件...');
    
    // 创建插件HTML结构
    const pluginHTML = `
        <!-- 弹窗通知 -->
        <div id="notificationPopup" class="notification-popup"></div>
        
        <!-- 悬浮按钮 -->
        <button class="float-btn" id="floatBtn" title="打开功能面板">➕</button>
        
        <!-- 悬浮窗口 -->
        <div class="float-window" id="floatWindow">
            <div class="window-header" id="windowHeader">
                <span>功能面板</span>
                <button class="modal-back" id="modalBack">返回</button>
            </div>
            
            <!-- 主功能按钮列表 -->
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
                    <!-- 登录/注册选项卡 -->
                    <div class="auth-tabs" id="authTabs">
                        <div class="auth-tab active" data-tab="login">登录</div>
                        <div class="auth-tab" data-tab="register">注册</div>
                    </div>
                    
                    <!-- 登录表单 -->
                    <div class="auth-form active" id="loginForm">
                        <h3 style="margin-bottom: 20px; color: #3b82f6;">登录账户</h3>
                        <div class="form-group">
                            <label>用户名</label>
                            <input type="text" id="loginUsername" placeholder="输入用户名">
                        </div>
                        <div class="form-group">
                            <label>密码</label>
                            <input type="password" id="loginPassword" placeholder="输入密码">
                        </div>
                        <div class="auto-login-group">
                            <input type="checkbox" id="autoLogin">
                            <label for="autoLogin">下次自动登录</label>
                        </div>
                        <button class="auth-btn" id="loginBtn">立即登录</button>
                        <div style="text-align: center; margin-top: 15px; font-size: 12px; color: #64748b;">
                            演示账号: test / 123456
                        </div>
                    </div>
                    
                    <!-- 注册表单 -->
                    <div class="auth-form" id="registerForm">
                        <h3 style="margin-bottom: 20px; color: #3b82f6;">注册账户</h3>
                        <div class="form-group">
                            <label>用户名</label>
                            <input type="text" id="registerUsername" placeholder="输入用户名">
                        </div>
                        <div class="form-group">
                            <label>邮箱（选填）</label>
                            <input type="email" id="registerEmail" placeholder="输入邮箱">
                        </div>
                        <div class="form-group">
                            <label>密码</label>
                            <input type="password" id="registerPassword" placeholder="输入密码">
                        </div>
                        <div class="form-group">
                            <label>确认密码</label>
                            <input type="password" id="registerConfirmPassword" placeholder="再次输入密码">
                        </div>
                        <button class="auth-btn" id="registerBtn">立即注册</button>
                    </div>
                    
                    <!-- 用户信息 -->
                    <div class="user-info" id="userInfo">
                        <div class="user-avatar">👤</div>
                        <h3 class="user-name" id="displayName">用户名</h3>
                        <p class="user-email" id="userEmail">user@example.com</p>
                        <button class="logout-btn" id="logoutBtn">退出登录</button>
                    </div>
                </div>
            </div>
            
            <!-- 公告面板 -->
            <div class="content-panel" id="panelNotice">
                <div style="padding: 20px;">
                    <h3 style="margin-bottom: 20px; color: #3b82f6;">📢 系统公告</h3>
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h4 style="margin: 0 0 10px 0; color: #1e293b;">🎉 悬浮窗插件 v2.1.0 发布</h4>
                        <p style="margin: 0; font-size: 13px; color: #475569;">
                            • 修复了所有已知问题<br>
                            • 优化了弹窗通知系统<br>
                            • 改进了用户界面和体验<br>
                            • 位置记忆默认开启
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- 联系面板 -->
            <div class="content-panel" id="panelContact">
                <div style="padding: 20px; text-align: center;">
                    <h3 style="margin-bottom: 20px; color: #3b82f6;">📞 联系支持</h3>
                    <p style="color: #64748b; margin-bottom: 20px;">如有问题或建议，请联系我们</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                        <p style="margin: 0; font-size: 13px; color: #3b82f6;">📧 support@example.com</p>
                    </div>
                </div>
            </div>
            
            <!-- 设置面板（已简化） -->
            <div class="content-panel" id="panelSetting">
                <div style="padding: 20px;">
                    <h3 style="margin-bottom: 20px; color: #3b82f6;">⚙️ 系统设置</h3>
                    <div style="margin-bottom: 20px;">
                        <div style="font-weight: 500; color: #475569; margin-bottom: 8px;">插件信息</div>
                        <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 13px; color: #475569;">版本</span>
                                <span style="font-size: 12px; background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 10px;">v2.1.0</span>
                            </div>
                        </div>
                        <div style="background: #f8fafc; padding: 12px; border-radius: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 13px; color: #475569;">位置记忆</span>
                                <span style="font-size: 12px; color: #10b981;">● 默认开启</span>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
                        <div style="font-size: 12px; color: #94a3b8; text-align: center;">
                            悬浮窗插件 © 2026
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
    let currentUser = null;
    let notificationTimeout = null;
    let notificationHideTimeout = null;
    
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
    
    // 智能通知系统（支持覆盖）
    function showNotification(message, type = 'info') {
        // 清除之前的定时器
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
        }
        if (notificationHideTimeout) {
            clearTimeout(notificationHideTimeout);
        }
        
        // 如果有正在显示的通知，立即隐藏
        if (notificationPopup.style.display === 'block') {
            notificationPopup.style.animation = 'slideOut 0.2s ease';
            
            // 等待动画完成
            setTimeout(() => {
                notificationPopup.style.display = 'none';
                showNewNotification(message, type);
            }, 200);
        } else {
            showNewNotification(message, type);
        }
    }
    
    function showNewNotification(message, type) {
        notificationPopup.textContent = message;
        notificationPopup.className = `notification-popup notification-${type}`;
        notificationPopup.style.display = 'block';
        notificationPopup.style.animation = 'slideUp 0.3s ease';
        
        // 3秒后自动隐藏
        notificationTimeout = setTimeout(() => {
            notificationPopup.style.animation = 'slideOut 0.3s ease';
            notificationHideTimeout = setTimeout(() => {
                notificationPopup.style.display = 'none';
            }, 300);
        }, 3000);
    }
    
    // 切换登录/注册表单
    function switchAuthTab(tab) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const tabs = document.querySelectorAll('.auth-tab');
        
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        if (tab === 'login') {
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        } else {
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        }
    }
    
    // 显示登录表单
    function showLoginForm() {
        const userInfo = document.getElementById('userInfo');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const authTabs = document.getElementById('authTabs');
        
        userInfo.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        authTabs.style.display = 'flex';
        
        // 切换到登录标签
        switchAuthTab('login');
        
        // 清空表单
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    }
    
    // 显示用户信息
    function showUserInfo() {
        const userInfo = document.getElementById('userInfo');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const authTabs = document.getElementById('authTabs');
        
        userInfo.classList.add('active');
        loginForm.classList.remove('active');
        registerForm.classList.remove('active');
        authTabs.style.display = 'none';
        
        if (currentUser) {
            document.getElementById('displayName').textContent = currentUser.username;
            document.getElementById('userEmail').textContent = currentUser.email || '未设置邮箱';
        }
    }
    
    // 处理登录
    function handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        
        if (!username || !password) {
            showNotification('请输入用户名和密码', 'error');
            return;
        }
        
        if (username === 'test' && password === '123456') {
            // 模拟登录成功
            currentUser = { 
                username: username, 
                email: username + '@example.com' 
            };
            
            // 保存自动登录设置
            const autoLoginChecked = document.getElementById('autoLogin').checked;
            localStorage.setItem('autoLogin', autoLoginChecked);
            
            if (autoLoginChecked) {
                localStorage.setItem('savedUsername', username);
            } else {
                localStorage.removeItem('savedUsername');
            }
            
            showNotification('登录成功！', 'success');
            setTimeout(showUserInfo, 1000);
        } else {
            showNotification('用户名或密码错误', 'error');
        }
    }
    
    // 处理注册
    function handleRegister() {
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();
        const confirmPassword = document.getElementById('registerConfirmPassword').value.trim();
        
        if (!username || !password) {
            showNotification('用户名和密码为必填', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('两次输入的密码不一致', 'error');
            return;
        }
        
        if (password.length < 6) {
            showNotification('密码长度不能少于6位', 'error');
            return;
        }
        
        // 模拟注册成功
        currentUser = { 
            username: username, 
            email: email || username + '@example.com' 
        };
        
        // 自动登录
        localStorage.setItem('autoLogin', 'true');
        localStorage.setItem('savedUsername', username);
        
        showNotification('注册成功！已自动登录', 'success');
        setTimeout(showUserInfo, 1000);
    }
    
    // 处理退出登录
    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('autoLogin');
        localStorage.removeItem('savedUsername');
        
        showNotification('已退出登录', 'success');
        setTimeout(() => {
            showLoginForm();
            document.getElementById('autoLogin').checked = false;
        }, 1000);
    }
    
    // 切换悬浮窗显示/隐藏
    function toggleFloatWindow() {
        if (floatWindow.style.display === 'block') {
            // 隐藏窗口
            floatWindow.style.display = 'none';
            floatWindow.classList.remove('active');
        } else {
            // 显示窗口
            initPosition();
            floatWindow.style.display = 'block';
            floatWindow.classList.add('active');
        }
    }
    
    // 切换面板
    function switchPanel(panelId) {
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
        if (isDragging) {
            isDragging = false;
            // 保存位置
            localStorage.setItem('floatWindowPos', JSON.stringify(currentPosition));
        }
    }
    
    // 绑定事件
    function bindEvents() {
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
        
        // 登录/注册选项卡切换
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                switchAuthTab(tabName);
            });
        });
        
        // 登录功能
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', handleLogin);
            
            // 按Enter键登录
            document.getElementById('loginPassword').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleLogin();
            });
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', handleRegister);
            
            // 按Enter键注册
            document.getElementById('registerConfirmPassword').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleRegister();
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
        
        // 检查自动登录
        const autoLogin = localStorage.getItem('autoLogin') === 'true';
        const savedUsername = localStorage.getItem('savedUsername');
        if (autoLogin && savedUsername) {
            currentUser = { 
                username: savedUsername, 
                email: savedUsername + '@example.com' 
            };
            document.getElementById('autoLogin').checked = true;
            setTimeout(showUserInfo, 500);
        } else {
            setTimeout(showLoginForm, 500);
        }
        
        // 阻止窗口内部点击事件冒泡
        floatWindow.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // 初始化
    function init() {
        initPosition();
        bindEvents();
        console.log('✅ 悬浮窗插件初始化完成');
    }
    
    // 执行初始化
    init();
}
