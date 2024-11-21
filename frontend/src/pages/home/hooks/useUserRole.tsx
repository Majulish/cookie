import { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

interface TokenPayload {
    username: string;
    role: string;
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
                const decodedToken = jwtDecode<TokenPayload>(token);
                setUserRole(decodedToken.role);
                console.log(userRole);
            } catch (error) {
                console.error('Failed to decode token:', error);
                setUserRole(null); 
            }
        }
    }, []);

    return userRole;
};

export default useUserRole;
