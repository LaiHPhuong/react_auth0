import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export const ChangePassword = () => {
    const { isLoading, user, logout } = useAuth0();
    const [form, setForm] = useState({});
    const [accessToken, setAccessToken] = useState('');
    const [updateStatus, setUpdateStatus] = useState('idle');

    const getAccessToken = async () => {
        const response = await fetch(`https://${import.meta.env.VITE_AUTH0_DOMAIN}/oauth/token`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                client_id: import.meta.env.VITE_AUTH0_API_CLIENT_ID,
                client_secret: import.meta.env.VITE_AUTH0_API_CLIENT_SECERT,
                audience: import.meta.env.VITE_AUTH0_API_CLIENT_AUDIENCE,
                grant_type: 'client_credentials',
            }),
        });
        return response.json();
    };

    // cấp grant_type: 'password' cho app API manager, và cài đặt API Authorization Settings
    const verifyPassword = async () => {
        const response = await fetch(`https://${import.meta.env.VITE_AUTH0_DOMAIN}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: import.meta.env.VITE_AUTH0_API_CLIENT_ID,
                client_secret: import.meta.env.VITE_AUTH0_API_CLIENT_SECERT,
                audience: import.meta.env.VITE_AUTH0_API_CLIENT_AUDIENCE,
                grant_type: 'password',
                username: user.email,
                password: form.old_password,
            }),
        });
        return response.ok;
    };

    const updatePassword = async () => {
        if (user?.sub) {
            const id = user.sub;
            setUpdateStatus('pending');
            const response = await fetch(
                `https://${import.meta.env.VITE_AUTH0_DOMAIN}/api/v2/users/${id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        password: form.password,
                        connection: 'Username-Password-Authentication',
                    }),
                }
            );
            setUpdateStatus('idle');
            return response.ok;
        }
    };

    const handleChangeValue = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        //console.log(form);

        const { password, confirm_password } = form;

        const verifyPasswordStatus = await verifyPassword();

        if (!verifyPasswordStatus) {
            return toast.error('Mật khẩu cũ không chính xác');
        }

        if (password !== confirm_password) {
            return toast.error('Mật khẩu mới nhập lại không khớp');
        }

        const status = await updatePassword();
        if (status) {
            toast.success('Thay đổi mật khẩu thành công. Hệ thống sẽ tự động đăng xuất sau 2 giây');
            setTimeout(() => {
                logout({ logoutParams: { returnTo: import.meta.env.VITE_APP_URL } });
            }, 2000);
        } else {
            toast.error('Thay đổi mật khẩu thất bại');
        }
        setForm({});
    };

    //setAccessToken ngay khi load để sửa dụng cho tiện
    useEffect(() => {
        async function fetchToken() {
            const { access_token } = await getAccessToken();
            setAccessToken(access_token);
        }

        fetchToken();
    }, [isLoading]);

    return (
        <>
            <div className="container">
                <div
                    className="card account-box shadow-lg"
                    style={{
                        maxWidth: '600px',
                        margin: 'auto',
                    }}
                >
                    {updateStatus === 'pending' && (
                        <div
                            className="overlay"
                            id="loading"
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                opacity: '0.5',
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            <div className="d-flex justify-content-center">
                                <div className="spinner-border" role="status"></div>
                            </div>
                        </div>
                    )}
                    <fieldset disabled={updateStatus === 'pending'}>
                        <div className="card-body">
                            <h3 className="text-center mb-4">👤 Thay đổi mật khẩu</h3>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Mật khẩu cũ</label>
                                    <input
                                        type="password"
                                        name="old_password"
                                        className="form-control"
                                        placeholder="Mật khẩu cũ"
                                        onChange={handleChangeValue}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        placeholder="Mật khẩu mới"
                                        onChange={handleChangeValue}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Nhập lại mật khẩu mới</label>
                                    <input
                                        type="password"
                                        name="confirm_password"
                                        className="form-control"
                                        placeholder="Nhập lại mật khẩu mới"
                                        onChange={handleChangeValue}
                                        required
                                    />
                                </div>

                                <div className="d-flex justify-content-end mt-4">
                                    <button className="btn btn-primary">💾 Lưu thay đổi</button>
                                </div>
                            </form>
                        </div>
                    </fieldset>
                </div>
            </div>
        </>
    );
};
