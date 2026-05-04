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
    
    return axios({
        method: 'post',
        url: `${BASE_URL}/auth/register`,
        headers: {
            'Content-Type': ''            
        },
        data,
    })    
    .catch(error => {        
        throw error;
    });
};


export const loginUser = ({ email, password }: loginUserProps) => {
    const data = { 
        email: email.trim(), 
        password: password 
    };    
    
    return axios({
        method: 'post',
        url: `${BASE_URL}/auth/login`,
        headers: {
            'Content-Type': '',            
        },
        data,
    })
    .then((response) => {
        const { token } = response.data;
        if (token) {
            storage.setToken(token);            
        }
        return response;
    })
    .catch(error => {        
        throw error;
    });
};

export const logoutUser = (): void => {
    storage.clearAll();    
};

export const getMe = async () => {
    const token = storage.getToken();    

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
        
        let userData = response.data;        
        
        if (response.data.user) {
            userData = response.data.user;
            console.log('Extracted user from response.user');
        }        
        
        if (!userData || !userData.email) {            
            throw new Error('Email не найден в ответе сервера');
        }        
        
        storage.setUser({
            name: userData.email.split('@')[0],
            email: userData.email,
        });        
        
        return { 
            data: {
                email: userData.email,
                selectedCourses: userData.selectedCourses || []
            } 
        };
    } catch (error) {        
        throw error;
    }
};