// 使用IIFE包装避免全局变量污染
(function() {
    // 用户注册函数
    async function signUp(email, password) {
        try {
            // 注册用户
            const { data, error } = await window.App.supabase.auth.signUp({
                email: email,
                password: password,
            });
            
            if (error) {
                throw new Error(error.message || '注册过程中发生未知错误');
            }
            
            // 注意：profiles记录现在通过数据库触发器自动创建
            // 我们不再需要手动在profiles表中创建记录
            
            console.log('注册成功:', data.user);
            return data.user; // 返回用户对象
        } catch (error) {
            console.error('注册失败:', error.message);
            throw error;
        }
    }

    // 用户登录函数
    async function signIn(email, password) {
        try {
            const { data, error } = await window.App.supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            
            if (error) {
                throw new Error(error.message || '登录过程中发生未知错误');
            }
            
            console.log('登录成功:', data.user);
            return data.user; // 返回用户对象
        } catch (error) {
            console.error('登录失败:', error.message);
            throw error;
        }
    }

    // 用户登出函数
    async function signOut() {
        try {
            const { error } = await window.App.supabase.auth.signOut();
            
            if (error) {
                throw error;
            }
            
            console.log('登出成功');
            return true;
        } catch (error) {
            console.error('登出失败:', error.message);
            throw error;
        }
    }

    // 检查当前用户状态
    async function getCurrentUser() {
        try {
            const { data: { user } } = await window.App.supabase.auth.getUser();
            return user;
        } catch (error) {
            console.error('获取用户信息失败:', error.message);
            return null;
        }
    }

    // 检查用户是否为管理员
    async function checkIfAdmin(userId) {
        // 如果没有用户ID，直接返回false
        if (!userId) {
            console.log('未提供用户ID，无法检查管理员权限');
            return false;
        }
        
        try {
            console.log('正在检查用户管理员权限:', userId);
            
            // 修复列名错误：使用'id'而不是'user_id'
            const { data, error } = await window.App.supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', userId)  // 修复：使用正确的列名'id'
                .single();
            
            if (error) {
                console.error('检查管理员权限失败:', error.message);
                // 如果是因为表不存在导致的错误，给出更友好的提示
                if (error.message.includes('relation') && error.message.includes('does not exist')) {
                    console.error('profiles表不存在，请运行README.md中的SQL语句创建表和触发器');
                }
                return false;
            }
            
            const isAdmin = data ? data.is_admin : false;
            console.log('管理员权限检查结果:', isAdmin);
            return isAdmin;
        } catch (error) {
            console.error('检查管理员权限时发生错误:', error.message);
            return false;
        }
    }

    // 验证管理员权限
    async function verifyAdminAccess() {
        try {
            const { data: { user } } = await window.App.supabase.auth.getUser();
            
            if (!user) {
                throw new Error('用户未登录');
            }
            
            const isAdmin = await checkIfAdmin(user.id);
            
            if (!isAdmin) {
                throw new Error('无管理员权限');
            }
            
            return true;
        } catch (error) {
            console.error('管理员权限验证失败:', error.message);
            throw error;
        }
    }

    // 监听认证状态变化
    function onAuthStateChange(callback) {
        return window.App.supabase.auth.onAuthStateChange(callback);
    }

    // 将认证相关函数添加到全局命名空间
    window.App = window.App || {};
    window.App.auth = {
        signUp,
        signIn,
        signOut,
        getCurrentUser,
        checkIfAdmin,
        verifyAdminAccess,
        onAuthStateChange
    };
})();