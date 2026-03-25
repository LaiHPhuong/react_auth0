import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth0 } from '@auth0/auth0-react';

import { Routes, Route, Link } from 'react-router-dom';

import { Home } from './pages/Home';
import { Account } from './pages/Account';
import { AuthMiddleware } from './middlewares/AuthMiddleware';
import { ChangePassword } from './pages/ChangePassword';
function App() {
    const {
        isLoading, // Loading state, the SDK needs to reach Auth0 on load
        isAuthenticated,
        error,
        loginWithRedirect, // Starts the login flow
        logout, // Starts the logout flow
        user, // User profile
    } = useAuth0();

    //console.log(user);

    if (isLoading) return 'Loading...';

    return (
        <>
            <div className="container py-3">
                {isAuthenticated ? (
                    <>
                        <div className="d-flex justify-content-between align-items-center border p-3 rounded bg-light mb-3">
                            <div>
                                <b>Xin chào, {user.name}</b>
                            </div>

                            <div className="d-flex gap-2">
                                <Link to="/account" className="btn btn-outline-primary btn-sm">
                                    Tài khoản
                                </Link>

                                <Link
                                    to="/change-password"
                                    className="btn btn-outline-primary btn-sm"
                                >
                                    Đổi mật khẩu
                                </Link>

                                <a
                                    href="#"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        logout({
                                            logoutParams: { returnTo: window.location.origin },
                                        });
                                    }}
                                >
                                    Đăng xuất
                                </a>
                            </div>
                        </div>

                        <pre style={{ display: 'none' }}>{JSON.stringify(user, null, 2)}</pre>
                    </>
                ) : (
                    <div className="d-flex gap-2">
                        {error && <p>Error: {error.message}</p>}
                        <button
                            className="btn btn-outline-primary"
                            onClick={() =>
                                loginWithRedirect({
                                    authorizationParams: {
                                        screen_hint: 'signup',
                                        ui_locales: 'vi',
                                    },
                                })
                            }
                        >
                            Đăng ký
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                loginWithRedirect({
                                    authorizationParams: {
                                        ui_locales: 'vi',
                                    },
                                });
                            }}
                        >
                            Đăng nhập
                        </button>

                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                loginWithRedirect({
                                    authorizationParams: {
                                        ui_locales: 'vi',
                                        connection: 'google-oauth2',
                                    },
                                });
                            }}
                        >
                            Đăng nhập google
                        </button>

                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                loginWithRedirect({
                                    authorizationParams: {
                                        ui_locales: 'vi',
                                        connection: 'facebook',
                                    },
                                });
                            }}
                        >
                            Đăng nhập facebook
                        </button>
                    </div>
                )}
            </div>

            <Routes>
                <Route path="/" element={<Home />}></Route>
                <Route element={<AuthMiddleware />}>
                    <Route path="/account" element={<Account />}></Route>
                    <Route path="/change-password" element={<ChangePassword />}></Route>
                </Route>
            </Routes>

            <ToastContainer />
        </>
    );
}

export default App;
