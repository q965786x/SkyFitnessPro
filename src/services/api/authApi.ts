import axios from "axios";
import { BASE_URL } from "../constants";
import { storage } from "../storage";

type registerUserProps = {
    email: string, 
    password: string   
};

type loginUserProps = {
    email: string, 
    password: string 
};

export const registerUser = ({ email, password }: registerUserProps) => {
    const data = { 
        email: email.trim(), 
        password: password 
    };
    
    console.log('Sending registration data:', { 
        email: data.email, 
        passwordLength: data.password.length
    });

    return axios({
        method: 'post',
        url: `${BASE_URL}/auth/register`,
        headers: {
            'Content-Type': ''            
        },
        data,
    })
    .then(response => {
        console.log('Registration SUCCESS:', response.data);
        return response;
    })
    .catch(error => {
        console.error('Registration error:', error.response?.data || error.message);
        throw error;
    });
};


export const loginUser = ({ email, password }: loginUserProps) => {
    const data = { 
        email: email.trim(), 
        password: password 
    };
    
    console.log('Sending login request:', { email: data.email, password: '***' });
    
    return axios({
        method: 'post',
        url: `${BASE_URL}/auth/login`,
        headers: {
            'Content-Type': '',            
        },
        data,
    })
    .then((response) => {
        console.log('Login response:', response.data);
        const { token } = response.data;
        if (token) {
            storage.setToken(token);
            console.log('Token saved successfully');
        }
        return response;
    })
    .catch(error => {
        console.error('Login error:', error.response?.data || error.message);
        throw error;
    });
};

export const logoutUser = (): void => {
    storage.clearAll();    
};

export const getMe = async () => {
    const token = storage.getToken();
    console.log('getMe called, token:', token ? 'exists' : 'not found');

    if (!token) {
        throw new Error('No token found');
    }

    try {
        const response = await axios({
            method: 'get',
            url: `${BASE_URL}/users/me`,
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        console.log('getMe raw response:', response.data);
        
        // Получаем данные пользователя (без обертки)
        let userData = response.data;
        
        // Если данные обернуты в поле user
        if (response.data.user) {
            userData = response.data.user;
            console.log('Extracted user from response.user');
        }
        
        // Проверяем, что email существует
        if (!userData || !userData.email) {
            console.error('Unexpected response structure:', response.data);
            throw new Error('Email не найден в ответе сервера');
        }
        
        console.log('Final userData:', userData);
        
        // Сохраняем пользователя в storage
        storage.setUser({
            name: userData.email.split('@')[0],
            email: userData.email,
        });
        
        // Возвращаем данные в ожидаемом формате
        return { 
            data: {
                email: userData.email,
                selectedCourses: userData.selectedCourses || []
            } 
        };
    } catch (error) {
        console.error('getMe error:', error);
        throw error;
    }
};