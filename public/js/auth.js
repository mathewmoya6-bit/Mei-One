/* ============================================================
MEI ONE - AUTHENTICATION
js/auth.js

Admin users  -> admin.html
Customers    -> dashboard.html
============================================================ */

(function () {
'use strict';

```
const SUPABASE =
    window.supabaseClient ||
    window.MEISupabase;

if (!SUPABASE) {
    console.error(
        'MEI One: Supabase client is not available.'
    );
    return;
}

const $ = selector =>
    document.querySelector(selector);

/* ----------------------------------------------------------
   CONFIG
---------------------------------------------------------- */

const ADMIN_ROLES = [
    'SUPER_ADMIN',
    'ADMIN',
    'OPERATIONS',
    'FINANCE',
    'SUPPORT',
    'AUDITOR'
];

/* ----------------------------------------------------------
   HELPERS
---------------------------------------------------------- */

function timeoutPromise(
    promise,
    milliseconds = 10000
) {
    return Promise.race([
        promise,

        new Promise((_, reject) => {
            setTimeout(() => {
                reject(
                    new Error(
                        'Request timed out.'
                    )
                );
            }, milliseconds);
        })
    ]);
}

function setLoading(
    loading,
    button = null
) {
    if (button) {
        button.disabled = loading;

        if (loading) {
            button.dataset.originalText =
                button.textContent;

            button.textContent =
                'Signing in...';
        } else {
            button.textContent =
                button.dataset.originalText ||
                'Sign in';
        }
    }

    document.body.classList.toggle(
        'auth-loading',
        loading
    );
}

function showError(message) {

    const errorElement =
        $('#loginError') ||
        $('#authError') ||
        $('.login-error');

    if (errorElement) {
        errorElement.textContent =
            message;

        errorElement.style.display =
            'block';

        return;
    }

    alert(message);
}

function clearError() {

    const errorElement =
        $('#loginError') ||
        $('#authError') ||
        $('.login-error');

    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display =
            'none';
    }
}

/* ----------------------------------------------------------
   CHECK ADMIN ROLE
---------------------------------------------------------- */

async function getAdminRecord(
    userId
) {

    try {

        const result =
            await timeoutPromise(
                SUPABASE
                    .from('admin_users')
                    .select(
                        'id,user_id,role,is_active'
                    )
                    .eq(
                        'user_id',
                        userId
                    )
                    .maybeSingle(),

                8000
            );

        if (result.error) {

            console.error(
                'MEI One: Admin lookup failed:',
                result.error
            );

            /*
             * IMPORTANT:
             * A failed admin lookup should not
             * prevent a normal customer from
             * signing in.
             */

            return null;
        }

        if (
            !result.data ||
            !result.data.is_active
        ) {
            return null;
        }

        if (
            !ADMIN_ROLES.includes(
                result.data.role
            )
        ) {
            return null;
        }

        return result.data;

    } catch (error) {

        console.error(
            'MEI One: Admin lookup timeout:',
            error
        );

        return null;
    }
}

/* ----------------------------------------------------------
   REDIRECT AFTER LOGIN
---------------------------------------------------------- */

async function redirectUser(
    user
) {

    if (!user?.id) {
        window.location.href =
            'login.html';

        return;
    }

    console.log(
        'MEI One: Checking account type...'
    );

    const admin =
        await getAdminRecord(
            user.id
        );

    if (admin) {

        console.log(
            'MEI One: Administrator detected:',
            admin.role
        );

        /*
         * SUPER_ADMIN and all active
         * administrator roles go here.
         */

        window.location.replace(
            'admin.html'
        );

        return;
    }

    console.log(
        'MEI One: Customer account detected.'
    );

    window.location.replace(
        'dashboard.html'
    );
}

/* ----------------------------------------------------------
   EXISTING SESSION
---------------------------------------------------------- */

async function checkExistingSession() {

    try {

        const result =
            await timeoutPromise(
                SUPABASE.auth.getSession(),
                8000
            );

        if (result.error) {

            console.error(
                'MEI One: Session error:',
                result.error
            );

            return;
        }

        const session =
            result.data?.session;

        if (!session?.user) {
            return;
        }

        console.log(
            'MEI One: Existing session found:',
            session.user.email
        );

        await redirectUser(
            session.user
        );

    } catch (error) {

        console.error(
            'MEI One: Session check failed:',
            error
        );
    }
}

/* ----------------------------------------------------------
   LOGIN
---------------------------------------------------------- */

async function handleLogin(
    event
) {

    event.preventDefault();

    clearError();

    const form =
        event.currentTarget;

    const emailInput =
        form.querySelector(
            '[name="email"], #email'
        );

    const passwordInput =
        form.querySelector(
            '[name="password"], #password'
        );

    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );

    const email =
        emailInput?.value
            ?.trim()
            .toLowerCase();

    const password =
        passwordInput?.value || '';

    if (!email) {

        showError(
            'Please enter your email address.'
        );

        return;
    }

    if (!password) {

        showError(
            'Please enter your password.'
        );

        return;
    }

    setLoading(
        true,
        submitButton
    );

    try {

        console.log(
            'MEI One: Signing in:',
            email
        );

        const result =
            await timeoutPromise(
                SUPABASE.auth
                    .signInWithPassword({
                        email,
                        password
                    }),
                12000
            );

        if (result.error) {

            console.error(
                'MEI One: Login failed:',
                result.error
            );

            throw result.error;
        }

        const user =
            result.data?.user;

        if (!user) {

            throw new Error(
                'Login succeeded but no user was returned.'
            );
        }

        console.log(
            'MEI One: Login successful:',
            user.email
        );

        /*
         * Give Supabase a moment to persist
         * the session before checking role.
         */

        await new Promise(resolve =>
            setTimeout(resolve, 150)
        );

        await redirectUser(
            user
        );

    } catch (error) {

        console.error(
            'MEI One: Authentication error:',
            error
        );

        let message =
            'Unable to sign in. Please try again.';

        if (
            error?.message
                ?.toLowerCase()
                .includes(
                    'invalid login credentials'
                )
        ) {
            message =
                'Incorrect email or password.';
        }

        if (
            error?.message
                ?.toLowerCase()
                .includes(
                    'email not confirmed'
                )
        ) {
            message =
                'Please confirm your email address before signing in.';
        }

        if (
            error?.message
                ?.toLowerCase()
                .includes(
                    'timed out'
                )
        ) {
            message =
                'The login request timed out. Please check your internet connection and try again.';
        }

        showError(
            message
        );

    } finally {

        setLoading(
            false,
            submitButton
        );
    }
}

/* ----------------------------------------------------------
   PASSWORD RESET
---------------------------------------------------------- */

async function handlePasswordReset(
    event
) {

    event.preventDefault();

    clearError();

    const emailInput =
        $('#email') ||
        $('[name="email"]');

    const email =
        emailInput?.value
            ?.trim()
            .toLowerCase();

    if (!email) {

        showError(
            'Enter your email address first.'
        );

        return;
    }

    try {

        const result =
            await timeoutPromise(
                SUPABASE.auth
                    .resetPasswordForEmail(
                        email,
                        {
                            redirectTo:
                                `${window.location.origin}/login.html`
                        }
                    ),
                10000
            );

        if (result.error) {
            throw result.error;
        }

        alert(
            'Password reset instructions have been sent to your email.'
        );

    } catch (error) {

        console.error(
            'MEI One: Password reset failed:',
            error
        );

        showError(
            'Unable to send password reset instructions.'
        );
    }
}

/* ----------------------------------------------------------
   PASSWORD VISIBILITY
---------------------------------------------------------- */

function setupPasswordToggle() {

    const buttons = document.querySelectorAll(
        '[data-password-toggle], #togglePassword, .password-toggle'
    );

    buttons.forEach(button => {

        button.addEventListener(
            'click',
            () => {

                const input =
                    $('#password') ||
                    $('[name="password"]');

                if (!input) {
                    return;
                }

                const visible =
                    input.type === 'text';

                input.type =
                    visible
                        ? 'password'
                        : 'text';

                button.textContent =
                    visible
                        ? 'Show'
                        : 'Hide';
            }
        );

    });
}

/* ----------------------------------------------------------
   AUTH STATE
---------------------------------------------------------- */

function setupAuthListener() {

    SUPABASE.auth.onAuthStateChange(
        async (
            event,
            session
        ) => {

            if (
                event ===
                'SIGNED_IN'
            ) {

                /*
                 * Do not redirect if this
                 * listener fires while the
                 * explicit login handler
                 * is already redirecting.
                 */

                if (
                    window.location.pathname
                        .toLowerCase()
                        .endsWith(
                            '/login.html'
                        )
                ) {

                    const user =
                        session?.user;

                    if (user) {
                        await redirectUser(
                            user
                        );
                    }
                }
            }

            if (
                event ===
                'SIGNED_OUT'
            ) {

                console.log(
                    'MEI One: Signed out.'
                );
            }
        }
    );
}

/* ----------------------------------------------------------
   INITIALIZE
---------------------------------------------------------- */

function init() {

    const loginForm =
        $('#loginForm') ||
        document.querySelector(
            'form'
        );

    if (loginForm) {

        loginForm.addEventListener(
            'submit',
            handleLogin
        );
    }

    const resetButton =
        $('#forgotPassword') ||
        $('[data-action="forgot-password"]');

    if (resetButton) {

        resetButton.addEventListener(
            'click',
            handlePasswordReset
        );
    }

    setupPasswordToggle();

    setupAuthListener();

    checkExistingSession();

    console.log(
        'MEI One: Auth initialized.'
    );
}

/* ----------------------------------------------------------
   START
---------------------------------------------------------- */

if (
    document.readyState ===
    'loading'
) {

    document.addEventListener(
        'DOMContentLoaded',
        init
    );

} else {

    init();

}
```

})();
