// 使用IIFE包装避免全局变量污染
(function() {
    // Supabase配置和初始化
    const SUPABASE_URL = 'https://xxiscklgihqjdwyybiwn.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4aXNja2xnaWhxamR3eXliaXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMzMzOTMsImV4cCI6MjA3ODcwOTM5M30.v_LYB5C_TJIfGkSs9oHqYgp29gNqJK5tE1RW443xyAg';

    // 初始化Supabase客户端（使用在index.html中通过script标签引入的全局supabase对象）
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 验证Supabase连接和表结构
    async function validateSupabaseConfig() {
        try {
            // 测试连接 - 简单查询profiles表
            const { data, error } = await supabase.from('profiles').select('id').limit(1);
            
            if (error) {
                console.error('Supabase连接测试失败:', error.message);
                return false;
            }
            
            console.log('Supabase连接成功！');
            return true;
        } catch (error) {
            console.error('Supabase配置验证失败:', error.message);
            return false;
        }
    }

    // 将supabase实例和验证函数添加到全局命名空间
    window.App = window.App || {};
    window.App.supabase = supabase;
    window.App.validateSupabaseConfig = validateSupabaseConfig;
})();