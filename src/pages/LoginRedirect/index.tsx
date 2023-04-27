import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from "react-router-dom";
import { userState } from '@/stores/user'
const backendUrl = 'https://test.server.prompterhub.com';

const LoginRedirect = (props:any) => {
    const [text, setText] = useState('Loading...');
    const location = useLocation();
    const params = useParams();
    const history = useHistory();

    useEffect(() => {
        // Successfully logged with the provider
        // Now logging with strapi by using the access_token (given by the provider) in props.location.search
        fetch(`${backendUrl}/api/auth/${params.providerName}/callback${location.search}`)
            .then(res => {
                if (res.status !== 200) {
                    throw new Error(`Couldn't login to Strapi. Status: ${res.status}`);
                }
                return res;
            })
            .then(res => res.json())
            .then(res => {
                // Successfully logged with Strapi
                // Now saving the jwt to use it for future authenticated requests to Strapi
                userState.jwt = `Bearer ${res.jwt}`
                userState.islogin = true
                userState.username = res.user.username
                setText('You have been successfully logged in. You will be redirected in a few seconds...');
                setTimeout(() => history.push('/'), 0); // Redirect to homepage after 3 sec
            })
            .catch(err => {
                console.log(err);
                setText('An error occurred, please see the developer console.')
            });
    }, [history, location.search, params.providerName]);

    return <p>{text}</p>
};

export default LoginRedirect;
