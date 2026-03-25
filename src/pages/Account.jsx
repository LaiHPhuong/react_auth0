import { toast } from 'react-toastify';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';

export const Account = () => {
    const { isLoading, user, getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();
    const [form, setForm] = useState({});

    const [currentUser, setCurrentUser] = useState({});

    const [accessToken, setAccessToken] = useState('');

    const [userStatus, setUserStatus] = useState('pending');
    const [updateStatus, setUpdateStatus] = useState('idle');

    const handleChangeValue = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // lấy token từ Auth0
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

    const getUser = async () => {
        if (user?.sub) {
            const id = user.sub;

            // set access token ngay khi vào trang
            const { access_token: accessToken } = await getAccessToken();
            setAccessToken(accessToken);

            const response = await fetch(
                `https://${import.meta.env.VITE_AUTH0_DOMAIN}/api/v2/users/${id}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const data = await response.json();
            setCurrentUser(data);

            setUserStatus('success');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        //console.log(form);

        const { address, interest, ...rest } = form;

        let isUpdateEmailOrPhone = false;
        if (user.email === rest.email) {
            delete rest.email; // nếu email không đổi thì bỏ email khỏi object form
        }
        if (currentUser.phone_number === rest.phone_number) {
            delete rest.phone_number; // do không cho phép cập nhật đồng thời email và phone cùng lúc
        } else {
            isUpdateEmailOrPhone = true;
        }

        // xử lý object theo chuẩn của auth0 để gửi lên
        rest.user_metadata = {
            address,
            interest,
        };

        //console.log(rest);

        // cập nhật user theo form
        const updateUser = async (form) => {
            const id = user.sub;

            const response = await fetch(
                `https://${import.meta.env.VITE_AUTH0_DOMAIN}/api/v2/users/${id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(form),
                }
            );
            return response.ok;
        };

        setUpdateStatus('pending');
        const status = await updateUser(rest);
        setUpdateStatus('idle');

        if (status) {
            // Cập nhật lại token, mail or sdt thay đổi thì đăng nhập lại
            if (isUpdateEmailOrPhone) {
                toast.success('Cập nhật tài khoản thành công. Vui lòng đăng nhập lại');

                await getAccessTokenWithPopup(); //bắt đăng nhập lại
            } else {
                toast.success('Cập nhật tài khoản thành công');

                await getAccessTokenSilently({
                    cacheMode: 'off',
                });
            }

            return;
        }

        toast.error('Đã có lỗi xảy ra. Vui lòng thử lại sau');
    };

    useEffect(() => {
        getUser();
    }, [isLoading]);

    useEffect(() => {
        // khi có được currentUser , gắn các giá trị CẦN CẬP NHẬT vào state form
        setForm({
            ...form,
            name: currentUser.name,
            email: currentUser.email,
            phone_number: currentUser.phone_number,
            address: currentUser.user_metadata?.address,
            interest: currentUser.user_metadata?.interest,
        });
    }, [currentUser]);

    //console.log(user);

    return (
        <>
            {isLoading ? (
                <div class="text-center mt-3">
                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                        <span class="visually-hidden pr-1"></span>
                    </div>
                </div>
            ) : (
                <div className="container">
                    <div
                        className="card account-box shadow-lg"
                        style={{
                            maxWidth: '600px',
                            margin: 'auto',
                        }}
                    >
                        {(userStatus === 'pending' || updateStatus === 'pending') && (
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
                        <fieldset disabled={userStatus === 'pending' || updateStatus === 'pending'}>
                            <div className="card-body">
                                <h3 className="text-center mb-4">👤 Tài khoản của bạn</h3>
                                <div className="text-center mb-4">
                                    <img
                                        src={user?.picture}
                                        className="avatar"
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '4px solid #eee',
                                        }}
                                    />
                                    <p className="mt-2">
                                        <b>Xin chào, {user?.name}</b>
                                    </p>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Tên người dùng</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            value={form?.name ?? ''}
                                            onChange={handleChangeValue}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control"
                                            value={form?.email ?? ''}
                                            onChange={handleChangeValue}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Số điện thoại</label>
                                        <input
                                            type="text"
                                            name="phone_number"
                                            className="form-control"
                                            value={form?.phone_number ?? ''}
                                            onChange={handleChangeValue}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Địa chỉ</label>
                                        <input
                                            type="text"
                                            name="address"
                                            className="form-control"
                                            value={form?.address ?? ''}
                                            onChange={handleChangeValue}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Sở thích</label>
                                        <input
                                            type="text"
                                            name="interest"
                                            className="form-control"
                                            value={form?.interest ?? ''}
                                            onChange={handleChangeValue}
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
            )}
        </>
    );
};
