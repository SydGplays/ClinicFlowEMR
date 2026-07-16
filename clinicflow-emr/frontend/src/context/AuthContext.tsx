import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../services/api'; import type { User } from '../types';
type AuthValue={user:User|null;loading:boolean;login:(email:string,password:string)=>Promise<void>;logout:()=>void};
const AuthContext=createContext<AuthValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}){ const [user,setUser]=useState<User|null>(null); const [loading,setLoading]=useState(true);
 useEffect(()=>{ const token=localStorage.getItem('clinicflow_token'); if(!token){setLoading(false);return;} api.get('/auth/me').then(r=>setUser(r.data)).finally(()=>setLoading(false)); },[]);
 const login=async(email:string,password:string)=>{const {data}=await api.post('/auth/login',{email,password});localStorage.setItem('clinicflow_token',data.token);setUser(data.user)};
 const logout=()=>{localStorage.removeItem('clinicflow_token');setUser(null)}; return <AuthContext.Provider value={{user,loading,login,logout}}>{children}</AuthContext.Provider> }
export const useAuth=()=>{const c=useContext(AuthContext);if(!c)throw new Error('useAuth must be inside AuthProvider');return c};

