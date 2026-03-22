(function() {
    // 防止重复注入
    if (window.floatingWindowInjected) return;
    window.floatingWindowInjected = true;

    // DOM元素获取
    const floatBtn = document.getElementById('floatBtn');
    const floatWindow = document.getElementById('floatWindow');
    const modalBack = document.getElementById('modalBack');
    const funcButtons = document.getElementById('funcButtons');
    const windowHeader = document.getElementById('windowHeader');
    const notificationPopup = document.getElementById('notificationPopup');
    
    // 登录相关变量
    let currentUser = null;
    let autoLogin = false;

    // 计算当前窗口下的居中位置
    function getCenterPosition() {
        return {
            left: (window.innerWidth - 300) / 2,
            top: (window.innerHeight - 280) / 2
        };
    }

    // 从本地存储读取上次位置，首次打开则自动居中
    let currentWindowPos = JSON.parse(localStorage.getItem('floatWindowPos')) || getCenterPosition();
    let btnIsDragging = false, winIsDragging = false;
    let btnDragStart = null, winDragStart = null;

    // DOM加载完成后初始化
    document.addEventListener('DOMContentLoaded', function() {
        bindEvents();
        bindAuthEvents(); // 绑定登录相关事件
        floatWindow.style.left = `${currentWindowPos.left}px`;
        floatWindow.style.top = `${currentWindowPos.top}px`;

        // 检查自动登录状态
        const savedAutoLogin = localStorage.getItem('autoLogin') === 'true';
        const savedUsername = localStorage.getItem('savedUsername');
        if (savedAutoLogin && savedUsername) {
            currentUser = { username: savedUsername, email: savedUsername + '@example.com' };
            showUserInfo();
        } else {
            showLoginForm();
        }
    });

    // 监听窗口大小变化，重新计算居中
    window.addEventListener('resize', function() {
        if (!localStorage.getItem('floatWindowPos')) {
            currentWindowPos = getCenterPosition();
            floatWindow.style.left = `${currentWindowPos.left}px`;
            floatWindow.style.top = `${currentWindowPos.top}px`;
        }
    });

    // 绑定事件监听器
    function bindEvents() {
        // 悬浮球点击：打开/关闭悬浮窗
        floatBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleFloatWindow();
        });

        // 悬浮球拖拽
        floatBtn.addEventListener('mousedown', startBtnDrag);
        floatBtn.addEventListener('touchstart', startBtnDragTouch);
        // 悬浮窗头部拖拽
        windowHeader.addEventListener('mousedown', startWinDrag);
        windowHeader.addEventListener('touchstart', startWinDragTouch);

        // 功能按钮点击切换面板
        document.getElementById('btnMy').addEventListener('click', (e) => { e.stopPropagation(); switchPanel('panelMy') });
        document.getElementById('btnNotice').addEventListener('click', (e) => { e.stopPropagation(); switchPanel('panelNotice') });
        document.getElementById('btnContact').addEventListener('click', (e) => { e.stopPropagation(); switchPanel('panelContact') });
        document.getElementById('btnSetting').addEventListener('click', (e) => { e.stopPropagation(); switchPanel('panelSetting') });

        // 返回按钮
        modalBack.addEventListener('click', function(e) {
            e.stopPropagation();
            backToFuncList();
        });

        // 全局拖拽事件
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('touchmove', doDragTouch);

        // 悬浮窗内部点击阻止冒泡（避免触发外部事件）
        floatWindow.addEventListener('click', (e) => e.stopPropagation());
    }

    // 绑定登录/注册相关事件
    function bindAuthEvents() {
        // 切换登录/注册标签
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                switchAuthTab(this.dataset.tab);
            });
        });

        // 登录按钮
        document.getElementById('login-btn').addEventListener('click', handleLogin);
        // 注册按钮
        document.getElementById('register-btn').addEventListener('click', handleRegister);
        // 退出登录按钮
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        // 自动登录复选框
        document.getElementById('auto-login').addEventListener('change', function() {
            autoLogin = this.checked;
        });
    }

    // 切换登录/注册表单
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

    // 显示登录表单
    function showLoginForm() {
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('login-form').classList.add('active');
        document.getElementById('register-form').classList.remove('active');
        document.getElementById('login-btn').style.display = 'block';
        document.getElementById('register-btn').style.display = 'none';
        // 修复：显示登录表单时，确保底部的登录/注册按钮和选项卡区域是可见的
        document.getElementById('auth-tabs').parentElement.style.display = 'block';
        document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector('[data-tab="login"]').classList.add('active');
    }

    // 显示用户信息
    function showUserInfo() {
        document.getElementById('login-form').classList.remove('active');
        document.getElementById('register-form').classList.remove('active');
        document.getElementById('user-info').style.display = 'block';
        // 修复：登录成功后，隐藏底部的登录/注册按钮和选项卡区域
        document.getElementById('auth-tabs').parentElement.style.display = 'none';
        document.getElementById('user-name').textContent = currentUser.username;
        document.getElementById('user-email').textContent = currentUser.email || '未设置邮箱';
    }

    // 处理登录（纯前端模拟）
    function handleLogin() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        if (!username || !password) {
            showNotification('请输入用户名和密码', 'error');
            return;
        }

        // 纯前端模拟登录成功
        currentUser = { username: username, email: username + '@example.com' };
        // 自动登录存储
        if (autoLogin) {
            localStorage.setItem('autoLogin', 'true');
    
