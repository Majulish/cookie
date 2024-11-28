import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
    sub: {
        username: string;
        role: string;
    };
}

const useUserRole = () => {
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const token = document.cookie
            .split('; ')
            .find((row) => row.startsWith('access_token='))
            ?.split('=')[1];

        if (token) {
            try {
                console.log('Token found:', token);
                const decodedToken = jwtDecode<TokenPayload>(token);
                console.log('Decoded token:', decodedToken);
                setUserRole(decodedToken.sub.role);
            } catch (error) {
                console.error('Failed to decode token:', error);
                setUserRole(null);
            }
        } else {
            console.log('No token found in cookies');
        }
    }, []);


    return userRole;
};

export default useUserRole;