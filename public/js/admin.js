/* ============================================================
   MEI ONE - ADMIN PANEL
   js/admin.js
   ============================================================ */

(function () {
    'use strict';

    const SUPABASE = window.supabaseClient || window.MEISupabase;

    if (!SUPABASE) {
        console.error('MEI One: Supabase client is not available.');
        return;
    }

    const CONFIG = window.MEI_CONFIG || {};

    /* ------------------------------------------------------------
       DOM HELPERS
    ------------------------------------------------------------ */

    const $ = (selector) => document.querySelector(selector);

    const $$ = (selector) => {
        return Array.from(document.querySelectorAll(selector));
    };

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function showToast(message, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
            return;
        }

        let toast = $('#mei-admin-toast');

        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'mei-admin-toast';

            toast.style.position = 'fixed';
            toast.style.right = '20px';
            toast.style.bottom = '20px';
            toast.style.zIndex = '99999';
            toast.style.padding = '14px 18px';
            toast.style.borderRadius = '12px';
            toast.style.background = '#101827';
            toast.style.color = '#ffffff';
            toast.style.fontWeight = '700';
            toast.style.boxShadow = '0 10px 30px rgba(0,0,0,.25)';

            document.body.appendChild(toast);
        }

        toast.textContent = message;

        if (type === 'error') {
            toast.style.border = '1px solid #ef4444';
        } else if (type === 'success') {
            toast.style.border = '1px solid #39ff88';
        } else {
            toast.style.border = '1px solid #334155';
        }

        clearTimeout(window.__meiAdminToastTimer);

        window.__meiAdminToastTimer = setTimeout(() => {
            toast.remove();
        }, 3500);
    }

    /* ------------------------------------------------------------
       AUTH / ADMIN STATE
    ------------------------------------------------------------ */

    let currentUser = null;
    let currentAdmin = null;

    async function getSession() {
        const { data, error } = await SUPABASE.auth.getSession();

        if (error) {
            console.error('MEI One: Session error:', error);
            return null;
        }

        return data?.session || null;
    }

    async function verifyAdmin(session) {
        if (!session?.user?.id) {
            return null;
        }

        const { data, error } = await SUPABASE
            .from('admin_users')
            .select(`
                id,
                user_id,
                role,
                is_active,
                created_at
            `)
            .eq('user_id', session.user.id)
            .maybeSingle();

        if (error) {
            console.error('MEI One: Admin verification failed:', error);

            showToast(
                'Unable to verify administrator access.',
                'error'
            );

            return null;
        }

        if (!data) {
            return null;
        }

        if (!data.is_active) {
            return null;
        }

        const allowedRoles = [
            'SUPER_ADMIN',
            'ADMIN',
            'OPERATIONS',
            'FINANCE',
            'SUPPORT',
            'AUDITOR'
        ];

        if (!allowedRoles.includes(data.role)) {
            return null;
        }

        return data;
    }

    /* ------------------------------------------------------------
       ACCESS DENIED
    ------------------------------------------------------------ */

    function accessDenied() {
        document.body.innerHTML = `
            <div style="
                min-height:100vh;
                display:flex;
                align-items:center;
                justify-content:center;
                padding:24px;
                background:#07111f;
                color:#ffffff;
                font-family:Arial,Helvetica,sans-serif;
            ">
                <div style="
                    width:100%;
                    max-width:460px;
                    padding:36px;
                    border-radius:20px;
                    background:#0d1b2e;
                    border:1px solid rgba(255,255,255,.08);
                    text-align:center;
                    box-shadow:0 20px 60px rgba(0,0,0,.35);
                ">
                    <div style="
                        width:64px;
                        height:64px;
                        margin:0 auto 20px;
                        border-radius:50%;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        background:rgba(239,68,68,.12);
                        color:#ef4444;
                        font-size:30px;
                    ">
                        !
                    </div>

                    <h1 style="
                        margin:0 0 10px;
                        font-size:28px;
                    ">
                        Access Denied
                    </h1>

                    <p style="
                        margin:0 0 24px;
                        color:#94a3b8;
                        line-height:1.6;
                    ">
                        Your account does not have an active MEI One
                        administrator role.
                    </p>

                    <button
                        id="accessDeniedLogout"
                        style="
                            border:0;
                            border-radius:12px;
                            padding:13px 22px;
                            background:#39ff88;
                            color:#061018;
                            font-weight:800;
                            cursor:pointer;
                        "
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        `;

        const button = $('#accessDeniedLogout');

        if (button) {
            button.addEventListener('click', async () => {
                await SUPABASE.auth.signOut();
                window.location.href = 'login.html';
            });
        }
    }

    /* ------------------------------------------------------------
       USER DISPLAY
    ------------------------------------------------------------ */

    function getUserName(user) {
        return (
            user?.user_metadata?.full_name ||
            user?.user_metadata?.name ||
            user?.email?.split('@')[0] ||
            'Administrator'
        );
    }

    function getInitials(name) {
        const words = String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (!words.length) {
            return 'A';
        }

        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        }

        return (
            words[0][0] +
            words[words.length - 1][0]
        ).toUpperCase();
    }

    function updateUserInterface() {
        if (!currentUser) {
            return;
        }

        const name = getUserName(currentUser);
        const email = currentUser.email || '';
        const role = currentAdmin?.role || 'ADMIN';

        const nameElements = [
            '#adminName',
            '#userName',
            '#profileName',
            '[data-admin-name]',
            '[data-user-name]'
        ];

        nameElements.forEach((selector) => {
            $$(selector).forEach((element) => {
                element.textContent = name;
            });
        });

        const emailElements = [
            '#adminEmail',
            '#userEmail',
            '#profileEmail',
            '[data-admin-email]',
            '[data-user-email]'
        ];

        emailElements.forEach((selector) => {
            $$(selector).forEach((element) => {
                element.textContent = email;
            });
        });

        const roleElements = [
            '#adminRole',
            '#userRole',
            '#profileRole',
            '[data-admin-role]',
            '[data-user-role]'
        ];

        roleElements.forEach((selector) => {
            $$(selector).forEach((element) => {
                element.textContent = formatRole(role);
            });
        });

        const avatarElements = [
            '#adminAvatar',
            '#userAvatar',
            '#profileAvatar',
            '[data-admin-avatar]'
        ];

        avatarElements.forEach((selector) => {
            $$(selector).forEach((element) => {
                element.textContent = getInitials(name);
            });
        });
    }

    function formatRole(role) {
        return String(role || '')
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    /* ------------------------------------------------------------
       DASHBOARD COUNTS
    ------------------------------------------------------------ */

    async function countRows(table, column = '*') {
        const { count, error } = await SUPABASE
            .from(table)
            .select(column, {
                count: 'exact',
                head: true
            });

        if (error) {
            console.error(
                `MEI One: Could not count ${table}:`,
                error
            );

            return null;
        }

        return count ?? 0;
    }

    async function loadDashboardStats() {
        const usersCount = await countRows('profiles');
        const servicesCount = await countRows('services');
        const paymentsCount = await countRows('payments');
        const activityCount = await countRows('activity_logs');

        setStatValue(
            [
                '#usersCount',
                '#statUsers',
                '[data-stat="users"]'
            ],
            usersCount
        );

        setStatValue(
            [
                '#servicesCount',
                '#statServices',
                '[data-stat="services"]'
            ],
            servicesCount
        );

        setStatValue(
            [
                '#paymentsCount',
                '#statPayments',
                '[data-stat="payments"]'
            ],
            paymentsCount
        );

        setStatValue(
            [
                '#activityCount',
                '#statActivity',
                '[data-stat="activity"]'
            ],
            activityCount
        );
    }

    function setStatValue(selectors, value) {
        selectors.forEach((selector) => {
            $$(selector).forEach((element) => {
                element.textContent =
                    value === null ? '—' : value;
            });
        });
    }

    /* ------------------------------------------------------------
       RECENT ACTIVITY
    ------------------------------------------------------------ */

    async function loadRecentActivity() {
        const { data, error } = await SUPABASE
            .from('activity_logs')
            .select(`
                id,
                action,
                entity_type,
                description,
                metadata,
                created_at
            `)
            .order('created_at', {
                ascending: false
            })
            .limit(10);

        if (error) {
            console.error(
                'MEI One: Could not load activity:',
                error
            );

            return;
        }

        renderRecentActivity(data || []);
    }

    function renderRecentActivity(items) {
        const containers = [
            $('#recentActivity'),
            $('#activityList'),
            $('[data-recent-activity]')
        ].filter(Boolean);

        if (!containers.length) {
            return;
        }

        if (!items.length) {
            containers.forEach((container) => {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">✓</div>
                        <h3>No activity yet</h3>
                        <p>
                            Administrator activity will appear here
                            as the system is used.
                        </p>
                    </div>
                `;
            });

            return;
        }

        const html = items.map((item) => {
            const action =
                item.description ||
                item.action ||
                'System activity';

            const date = formatDate(item.created_at);

            return `
                <div class="activity-item">
                    <div class="activity-icon">
                        ✓
                    </div>

                    <div class="activity-content">
                        <div class="activity-title">
                            ${escapeHtml(action)}
                        </div>

                        <div class="activity-meta">
                            ${escapeHtml(
                                item.entity_type || 'System'
                            )}
                            ·
                            ${escapeHtml(date)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        containers.forEach((container) => {
            container.innerHTML = html;
        });
    }

    function formatDate(value) {
        if (!value) {
            return 'Unknown time';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return 'Unknown time';
        }

        return date.toLocaleString('en-KE', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    }

    /* ------------------------------------------------------------
       ACTIVITY LOGGING
    ------------------------------------------------------------ */

    async function logActivity(
        action,
        description = '',
        entityType = null,
        entityId = null,
        metadata = {}
    ) {
        if (!currentAdmin || !currentUser) {
            return;
        }

        const { error } = await SUPABASE
            .from('activity_logs')
            .insert({
                user_id: currentUser.id,
                admin_user_id: currentAdmin.id,
                action,
                entity_type: entityType,
                entity_id: entityId,
                description,
                metadata
            });

        if (error) {
            console.error(
                'MEI One: Activity log error:',
                error
            );
        }
    }

    /* ------------------------------------------------------------
       NAVIGATION
    ------------------------------------------------------------ */

    function setupNavigation() {
        const navItems = $$(
            '[data-section], .admin-nav a, .sidebar a'
        );

        navItems.forEach((item) => {
            item.addEventListener('click', (event) => {
                const target =
                    item.dataset.section ||
                    item.getAttribute('href');

                if (!target) {
                    return;
                }

                if (
                    target === '#' ||
                    target.startsWith('#')
                ) {
                    event.preventDefault();

                    const section =
                        target.replace(/^#/, '');

                    activateSection(section);
                }
            });
        });
    }

    function activateSection(section) {
        $$('[data-section-content]').forEach((element) => {
            element.classList.remove('active');
        });

        const target = document.querySelector(
            `[data-section-content="${section}"]`
        );

        if (target) {
            target.classList.add('active');
        }

        $$('[data-section]').forEach((item) => {
            item.classList.toggle(
                'active',
                item.dataset.section === section
            );
        });
    }

    /* ------------------------------------------------------------
       MOBILE SIDEBAR
    ------------------------------------------------------------ */

    function setupMobileSidebar() {
        const menuButtons = [
            $('#menuToggle'),
            $('#mobileMenuToggle'),
            $('#sidebarToggle'),
            $('[data-sidebar-toggle]')
        ].filter(Boolean);

        const sidebar =
            $('#sidebar') ||
            $('.sidebar') ||
            $('[data-sidebar]');

        if (!sidebar) {
            return;
        }

        menuButtons.forEach((button) => {
            button.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        });
    }

    /* ------------------------------------------------------------
       LOGOUT
    ------------------------------------------------------------ */

    function setupLogout() {
        const logoutButtons = $$(
            '#logoutBtn, #signOutBtn, [data-action="logout"]'
        );

        logoutButtons.forEach((button) => {
            button.addEventListener('click', async (event) => {
                event.preventDefault();

                button.disabled = true;

                try {
                    await logActivity(
                        'LOGOUT',
                        'Administrator signed out of MEI One.'
                    );

                    const { error } =
                        await SUPABASE.auth.signOut();

                    if (error) {
                        throw error;
                    }

                    window.location.href = 'login.html';
                } catch (error) {
                    console.error(
                        'MEI One: Logout failed:',
                        error
                    );

                    button.disabled = false;

                    showToast(
                        'Unable to sign out. Please try again.',
                        'error'
                    );
                }
            });
        });
    }

    /* ------------------------------------------------------------
       AUTH STATE
    ------------------------------------------------------------ */

    function listenForAuthChanges() {
        SUPABASE.auth.onAuthStateChange(
            (event, session) => {
                if (
                    event === 'SIGNED_OUT' ||
                    !session
                ) {
                    window.location.href = 'login.html';
                }
            }
        );
    }

    /* ------------------------------------------------------------
       INITIALIZATION
    ------------------------------------------------------------ */

    async function initAdmin() {
        try {
            const session = await getSession();

            if (!session) {
                window.location.href = 'login.html';
                return;
            }

            currentUser = session.user;

            currentAdmin = await verifyAdmin(session);

            if (!currentAdmin) {
                accessDenied();
                return;
            }

            console.log(
                'MEI One: Admin authenticated.',
                {
                    email: currentUser.email,
                    role: currentAdmin.role
                }
            );

            updateUserInterface();

            setupNavigation();
            setupMobileSidebar();
            setupLogout();
            listenForAuthChanges();

            await Promise.all([
                loadDashboardStats(),
                loadRecentActivity()
            ]);

            await logActivity(
                'ADMIN_LOGIN',
                'Administrator opened the MEI One admin dashboard.'
            );

            console.log(
                'MEI One Admin:',
                formatRole(currentAdmin.role)
            );

        } catch (error) {
            console.error(
                'MEI One: Admin initialization failed:',
                error
            );

            showToast(
                'Admin dashboard could not be loaded.',
                'error'
            );
        }
    }

    /* ------------------------------------------------------------
       EXPOSE ADMIN HELPERS
    ------------------------------------------------------------ */

    window.MEIAdmin = {
        getUser: () => currentUser,
        getAdmin: () => currentAdmin,
        isSuperAdmin: () =>
            currentAdmin?.role === 'SUPER_ADMIN',
        isAdmin: () =>
            Boolean(currentAdmin?.is_active),
        logActivity,
        reloadStats: loadDashboardStats,
        reloadActivity: loadRecentActivity
    };

    /* ------------------------------------------------------------
       START
    ------------------------------------------------------------ */

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            initAdmin
        );
    } else {
        initAdmin();
    }

})();
