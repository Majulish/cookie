import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
    sub: {
        username: string;
        role: string;
    };
}

const useUserRole = () => {
    // Initialize with undefined instead of null
    // This way we can distinguish between "still loading" (undefined)
    // and "loaded but no role found" (null)
    const [userRole, setUserRole] = useState<string | null | undefined>(undefined);

    useEffect(() => {
        const token = document.cookie
            .split('; ')
            .find((row) => row.startsWith('access_token='))
            ?.split('=')[1];

        if (token) {
            try {
                console.log('Token found in cookie');
                const decodedToken = jwtDecode<TokenPayload>(token);
                console.log('Decoded role:', decodedToken.sub.role);
                // Normalize role to lowercase to prevent case sensitivity issues
                setUserRole(decodedToken.sub.role.toLowerCase());
            } catch (error) {
                console.error('Failed to decode token:', error);
                setUserRole(null);
            }
        } else {
            console.log('No token found in cookies');
            setUserRole(null);
        }
    }, []);

    return userRole;
};

export default useUserRole;