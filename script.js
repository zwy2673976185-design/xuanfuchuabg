// 悬浮窗插件核心逻辑 v1.0
// 基于 wm.html 重构，支持动态注入
(function() {
    // 防止重复注入
    if (window.floatingWindowInjected) {
        console.log('悬浮窗插件已加载，跳过重复初始化。');
        return;
    }
    window.floatingWindowInjected = true;

    // 1. 动态创建插件所需的DOM结构
    const pluginHTML = `
        <!-- 弹窗通知容器 -->
        <div id="notificationPopup" class="notification-popup"></div>
        
        <!-- 悬浮按钮 -->
        <button class="float-btn" id="floatBtn"></button>
        
        <!-- 悬浮窗口 -->
        <div class="float-window" id="floatWindow">
            <div class="window-header" id="windowHeader">
                功能面板
                <button class="modal-back" id="modalBack">返回</button>
            </div>
            <div class="func-buttons" id="funcButtons">
                <button class="func-btn" id="btnMy">
                    <span>我的</span>
                    <img src="https://cdn-icons-png.flaticon.com/512/1077/1077063.png" class="btn-icon" alt="我的">
                </button>
                <button class="func-btn" id="btnNotice">
                    <span>公告更新</span>
                    <img src="https://cdn-icons-png.flaticon.com/512/2913/2913028.png" class="btn-icon" alt="公告更新">
                </button>
                <button class="func-btn" id="btnContact">
                    <span>联系作者</span>
                    <img src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" class="btn-icon" alt="联系作者">
                </button>
                <button class="func-btn" id="btnSetting">
                    <span>设置</span>
                    <img src="https://cdn-icons-png.flaticon.com/512/126/126473.png" class="btn-icon" alt="设置">
                </button>
            </div>

            <!-- 我的面板：登录/注册 + 自动登录 -->
            <div class="content-panel" id="panelMy">
                <div class="auth-container" id="authContainer">
                    <div class="auth-header">
                        <!-- 预留空间 -->
                    </div>
                    <div class="auth-content">
                        <!-- 登录表单 -->
                        <div class="auth-form active" id="login-form">
                            <h3>登录账户</h3>
                            <div class="form-group">
                                <label for="login-username">用户名</label>
                                <input type="text" id="login-username" placeholder="请输入用户名">
                            </div>
                            <div class="form-group">
                                <label for="login-password">密码</label>
                                <input type="password" id="login-password" placeholder="请输入密码">
                            </div>
                            <div class="form-group" style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
                                <input type="checkbox" id="auto-login" style="width: auto;">
                                <label for="auto-login" style="margin: 0; font-size: 12px;">自动登录</label>
                            </div>
                        </div>
                        <!-- 注册表单 -->
                        <div class="auth-form" id="register-form">
                            <h3>注册账户</h3>
                            <div class="form-group">
                                <label for="register-username">用户名</label>
                                <input type="text" id="register-username" placeholder="请输入用户名">
                            </div>
                            <div class="form-group">
                                <label for="register-email">邮箱 (选填)</label>
                                <input type="email" id="register-email" placeholder="请输入邮箱">
                            </div>
                            <div class="form-group">
                                <label for="register-password">密码</label>
                                <input type="password" id="register-password" placeholder="请输入密码">
                            </div>
                        </div>
                        <!-- 登录成功后显示的用户信息 -->
                        <div class="user-info" id="user-info">
                            <div class="user-avatar">👤</div>
                            <div class="user-name" id="user-name">用户名</div>
                            <div class="user-email" id="user-email">user@example.com</div>
                            <button class="logout-btn" id="logout-btn">退出登录</button>
                        </div>
                    </div>
                    <div class="auth-footer">
                        <button class="auth-btn" id="login-btn">登录</button>
                        <button class="auth-btn" id="register-btn" style="display: none;">注册</button>
                        <div class="auth-tabs" id="auth-tabs">
                            <div class="auth-tab active" data-tab="login">登录</div>
                            <div class="auth-tab" data-tab="register">注册</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 公告面板 -->
            <div class="content-panel" id="panelNotice">
                <div style="text-align: center; padding: 20px; color: #666;">
                    <h3 style="margin-bottom: 10px;">📢 公告系统</h3>
                    <p style="font-size: 13px; margin-bottom: 15px;">系统运行正常</p>
                    <p style="font-size: 12px; color: #999;">悬浮窗核心功能已保留</p>
                </div>
            </div>
            
            <!-- 联系作者面板 -->
            <div class="content-panel" id="panelContact">
                <div style="text-align: center; padding: 20px;">
                    <h3 style="margin-bottom: 10px;">📞 联系作者</h3>
                    <p style="font-size: 13px; margin-bottom: 10px;">如有问题或建议，请联系管理员</p>
                    <p style="font-size: 12px; color: #666; background: #f5f5f5; padding: 10px; border-radius: 5px;">
                        可自定义添加联系方式
                    </p>
                </div>
            </div>
            
            <!-- 设置面板 -->
            <div class="content-panel" id="panelSetting">
                <div style="padding: 5px;">
                    <h3 style="margin-bottom: 15px; color: #2d3748;">系统设置</h3>
                    <p style="margin-bottom: 8px; font-size: 13px; color: #4a5568;">
                        <strong>版本:</strong> v1.0.0
                    </p>
                    <p style="margin-bottom: 8px; font-size: 13px; color: #4a5568;">
                        <strong>悬浮窗功能:</strong> 正常启用
                    </p>
                    <p style="margin-bottom: 8px; font-size: 13px; color: #4a5568;">
                        <strong>拖拽功能:</strong> 已开启
                    </p>
                </div>
            </div>
        </div>
    `;

    // 2. 将插件HTML结构注入到页面中
    // 尝试注入到 #floating-window-container，如果没有则注入到 body 末尾
    const container = document.getElementById('floating-window-container') || document.body;
    container.insertAdjacentHTML('beforeend', pluginHTML);

    // 3. 以下是您原有的、完整的JavaScript逻辑，从 wm.html 中复制而来
    // 所有变量、函数、事件绑定都得到保留，确保功能完全一致
    const floatBtn = document.getElementById('floatBtn');
    const floatWindow = document.getElementById('floatWindow');
    const modalBack = document.getElementById('modalBack');
    const funcButtons = document.getElementById('funcButtons');
    const windowHeader = document.getElementById('windowHeader');
    const notificationPopup = document.getElementById('notificationPopup');
    
    let currentUser = null;
    let autoLogin = false;

    function getCenterPosition() {
        return {
            left: (window.innerWidth - 300) / 2,
            top: (window.innerHeight - 280) / 2
        };
    }

    let currentWindowPos = JSON.parse(localStorage.getItem('floatWindowPos')) || getCenterPosition();
    let btnIsDragging = false, winIsDragging = false;
    let btnDragStart = null, winDragStart = null;

    // DOM加载完成后初始化
    function initializePlugin() {
        bindEvents();
        bindAuthEvents();
        floatWindow.style.left = `${currentWindowPos.left}px`;
        floatWindow.style.top = `${currentWindowPos.top}px`;

        const savedAutoLogin = localStorage.getItem('autoLogin') === 'true';
        const savedUsername = localStorage.getItem('savedUsername');
        if (savedAutoLogin && savedUsername) {
            currentUser = { username: savedUsername, email: savedUsername + '@example.com' };
            showUserInfo();
        } else {
            showLoginForm();
        }
    }

    window.addEventListener('resize', function() {
        if (!localStorage.getItem('floatWindowPos')) {
            currentWindowPos = getCenterPosition();
            floatWindow.style.left = `${currentWindowPos.left}px`;
            floatWindow.style.top = `${currentWindowPos.top}px`;
        }
    });

    function bindEvents() {
        floatBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleFloatWindow();
        });

        floatBtn.addEventListener('mousedown', startBtnDrag);
        floatBtn.addEventListener('touchstart', startBtnDragTouch);
        windowHeader.addEventListener('mousedown', startWinDrag);
        windowHeader.addEventListener('touchstart', startWinDragTouch);

        document.getElementById('btnMy').addEventListener('click', (e) => { e.stopPropagation(); switchPanel('panelMy') });
        document.getElementById('btnNotice').addEventListener('click', (e) => { e.stopPropagation(); switchPanel('panelNotice') });
        document.getElementById('btnContact').addEventListener('click', (e) => { e.stopPropagation(); switchPanel('panelContact') });
        document.getElementById('btnSetting').addEventListener('click', (e) => { e.stopPropagation(); switchPanel('panelSetting') });

        modalBack.addEventListener('click', function(e) {
            e.stopPropagation();
            backToFuncList();
        });

        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('touchmove', doDragTouch);

        floatWindow.addEventListener('click', (e) => e.stopPropagation());
    }

    function bindAuthEvents() {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                switchAuthTab(this.dataset.tab);
            });
        });

        document.getElementById('login-btn').addEventListener('click', handleLogin);
        document.getElementById('register-btn').addEventListener('click', handleRegister);
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        document.getElementById('auto-login').addEventListener('change', function() {
            autoLogin = this.checked;
        });
    }

    function switchAuthTab(tabType) {
        document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-tab="${tabType}"]`).classList.add('active');

        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        if (tabType === 'login') {
            document.getElementById('login-form').classList.add('active');
            document.getElementById('login-btn').style.display = 'block';
            document.getElementById('register-btn').style.display = 'none';
        } else {
            document.getElementById('register-form').classList.add('active');
            document.getElementById('login-btn').style.display = 'none';
            document.getElementById('register-btn').style.display = 'block';
        }
    }

    function showLoginForm() {
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('login-form').classList.add('active');
        document.getElementById('register-form').classList.remove('active');
        document.getElementById('login-btn').style.display = 'block';
        document.getElementById('register-btn').style.display = 'none';
        document.getElementById('auth-tabs').parentElement.style.display = 'block';
        document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector('[data-tab="login"]').classList.add('active');
    }

    function showUserInfo() {
        document.getElementById('login-form').classList.remove('active');
        document.getElementById('register-form').classList.remove('active');
        document.getElementById('user-info').style.display = 'block';
        document.getElementById('auth-tabs').parentElement.style.display = 'none';
        document.getElementById('user-name').textContent = currentUser.username;
        document.getElementById('user-email').textContent = currentUser.email || '未设置邮箱';
    }

    function handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        if (!username || !password) {
            showNotification('请输入用户名和密码', 'error');
            return;
        }

        currentUser = { username: username, email: username + '@example.com' };
        if (autoLogin) {
            localStorage.setItem('autoLogin', 'true');
            localStorage.setItem('savedUsername', username);
        } else {
            localStorage.removeItem('autoLogin');
            localStorage.removeItem('savedUsername');
        }
        showNotification('登录成功！', 'success');
        setTimeout(() => showUserInfo(), 1000);
    }

    function handleRegister() {
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value.trim();

        if (!username || !password) {
            showNotification('用户名和密码为必填', 'error');
            return;
        }

        showNotification('注册成功，请登录', 'success');
        setTimeout(() => switchAuthTab('login'), 1000);
    }

    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('autoLogin');
        localStorage.removeItem('savedUsername');
        showNotification('已退出登录', 'success');
        setTimeout(() => {
            showLoginForm();
            document.getElementById('login-username').value = '';
            document.getElementById('login-password').value = '';
            document.getElementById('auto-login').checked = false;
            autoLogin = false;
        }, 1000);
    }

    function showNotification(message, type) {
        notificationPopup.textContent = message;
        notificationPopup.className = `notification-popup notification-${type}`;
        
        notificationPopup.style.display = 'block';
        notificationPopup.style.animation = 'slideUp 0.3s ease-out';
        
        setTimeout(() => {
            notificationPopup.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                notificationPopup.style.display = 'none';
            }, 300);
        }, 3000);
    }

    function toggleFloatWindow() {
        if (floatWindow.classList.contains('active')) {
            floatWindow.classList.remove('active');
            floatWindow.style.display = 'none';
        } else {
            floatWindow.classList.add('active');
            floatWindow.style.display = 'block';
            floatWindow.style.opacity = '1';
            floatWindow.style.left = `${currentWindowPos.left}px`;
            floatWindow.style.top = `${currentWindowPos.top}px`;
        }
    }

    function switchPanel(targetId) {
        document.querySelectorAll('.content-panel').forEach(panel => {
            panel.classList.remove('active');
            panel.style.display = 'none';
        });
        funcButtons.style.display = 'none';
        modalBack.style.display = 'block';
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
            targetPanel.classList.add('active');
            targetPanel.style.display = 'block';
        }
    }

    function backToFuncList() {
        document.querySelectorAll('.content-panel').forEach(panel => {
            panel.classList.remove('active');
            panel.style.display = 'none';
        });
        funcButtons.style.display = 'flex';
        modalBack.style.display = 'none';
    }

    function startBtnDrag(e) {
        btnIsDragging = true;
        btnDragStart = { x: e.clientX, y: e.clientY, rect: floatBtn.getBoundingClientRect() };
        e.preventDefault();
    }
    function startBtnDragTouch(e) {
        if (e.touches.length === 1) {
            btnIsDragging = true;
            const touch = e.touches[0];
            btnDragStart = { x: touch.clientX, y: touch.clientY, rect: floatBtn.getBoundingClientRect() };
        }
    }

    function startWinDrag(e) {
        if (!floatWindow.classList.contains('active')) return;
        winIsDragging = true;
        winDragStart = { x: e.clientX, y: e.clientY, rect: floatWindow.getBoundingClientRect() };
        e.preventDefault();
    }
    function startWinDragTouch(e) {
        if (!floatWindow.classList.contains('active')) return;
        if (e.touches.length === 1) {
            winIsDragging = true;
            const touch = e.touches[0];
            winDragStart = { x: touch.clientX, y: touch.clientY, rect: floatWindow.getBoundingClientRect() };
        }
    }

    function doDrag(e) {
        if (btnIsDragging) {
            const dx = e.clientX - btnDragStart.x;
            const dy = e.clientY - btnDragStart.y;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                const newLeft = Math.max(20, Math.min(btnDragStart.rect.left + dx, window.innerWidth - 80));
                const newTop = Math.max(20, Math.min(btnDragStart.rect.top + dy, window.innerHeight - 80));
                floatBtn.style.left = `${newLeft}px`;
                floatBtn.style.top = `${newTop}px`;
                floatBtn.style.right = 'auto';
                floatBtn.style.bottom = 'auto';
            }
        }
        if (winIsDragging) {
            const dx = e.clientX - winDragStart.x;
            const dy = e.clientY - winDragStart.y;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                currentWindowPos = {
                    left: Math.max(20, Math.min(winDragStart.rect.left + dx, window.innerWidth - 300 - 20)),
                    top: Math.max(20, Math.min(winDragStart.rect.top + dy, window.innerHeight - 280 - 20))
                };
                floatWindow.style.left = `${currentWindowPos.left}px`;
                floatWindow.style.top = `${currentWindowPos.top}px`;
                localStorage.setItem('floatWindowPos', JSON.stringify(currentWindowPos));
            }
        }
    }

    function doDragTouch(e) {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        if (btnIsDragging) {
            const dx = touch.clientX - btnDragStart.x;
            const dy = touch.clientY - btnDragStart.y;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                const newLeft = Math.max(20, Math.min(btnDragStart.rect.left + dx, window.innerWidth - 80));
                const newTop = Math.max(20, Math.min(btnDragStart.rect.top + dy, window.innerHeight - 80));
                floatBtn.style.left = `${newLeft}px`;
                floatBtn.style.top = `${newTop}px`;
                floatBtn.style.right = 'auto';
                floatBtn.style.bottom = 'auto';
            }
        }
        if (winIsDragging) {
            const dx = touch.clientX - winDragStart.x;
            const dy = touch.clientY - winDragStart.y;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                currentWindowPos = {
                    left: Math.max(20, Math.min(winDragStart.rect.left + dx, window.innerWidth - 300 - 20)),
                    top: Math.max(20, Math.min(winDragStart.rect.top + dy, window.innerHeight - 280 - 20))
                };
                floatWindow.style.left = `${currentWindowPos.left}px`;
                floatWindow.style.top = `${currentWindowPos.top}px`;
                localStorage.setItem('floatWindowPos', JSON.stringify(currentWindowPos));
            }
        }
    }

    function stopDrag() {
        btnIsDragging = false;
        winIsDragging = false;
    }

    // 4. 在合适的时机初始化插件
    if (document.readyState === 'loading') {
        // 如果DOM还在加载，等待加载完成
        document.addEventListener('DOMContentLoaded', initializePlugin);
    } else {
        // 如果DOM已经加载完成，直接初始化
        initializePlugin();
    }

})(); // 立即执行函数结束
