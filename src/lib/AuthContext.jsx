import {commerceEnabled} from "@/data/relaunch";
import { createContext, useState, useContext, useEffect, useCallback, useRef } from "react";
import { api,identity } from "@/api/client";
import { queryClientInstance } from "@/lib/query-client";
const AuthContext = createContext(null);
export function AuthProvider({children}) {
  const [user,setUser]=useState(null);
  const [isLoadingAuth,setLoading]=useState(true);
  const [isLoadingPublicSettings,setLoadingSettings]=useState(true);
  const [authError,setError]=useState(null);
  const [authChecked,setChecked]=useState(false);
  const [appPublicSettings,setSettings]=useState(null);
  const generation=useRef(0);
  const checkUserAuth=useCallback(async()=>{
    const current=generation.current;
    setLoading(true);
    try {
      const u=await api.auth.me();
      if(current!==generation.current)return;
      setUser(u);setError(null);
    } catch {
      if(current!==generation.current)return;
      setUser(null);
    } finally {
      if(current===generation.current){setLoading(false);setChecked(true);}
    }
  },[]);
  const checkAppState=useCallback(async()=>{
    setLoadingSettings(true);
    setSettings({name:'Copper Pirates'});
    setLoadingSettings(false);
    if(!commerceEnabled && !/^\/(admin|login|forgot-password|reset-password)(?:\/|$)/.test(window.location.pathname)){
      setUser(null);setLoading(false);setChecked(true);return;
    }
    await checkUserAuth();
  },[checkUserAuth]);
  useEffect(()=>{
    checkAppState();
    const refresh=(event)=>{if(event.persisted)checkUserAuth();};
    window.addEventListener('pageshow',refresh);
    return ()=>window.removeEventListener('pageshow',refresh);
  },[checkAppState,checkUserAuth]);
  const logout=async()=>{
    try {
      const result=await identity.signOut();
      if(result.error)throw new Error(result.error.message);
      generation.current+=1;
      setUser(null);setError(null);setChecked(true);setLoading(false);
      queryClientInstance.clear();
      try {sessionStorage.removeItem("cpd_checkout");}catch { /* no storage */ }
      window.location.assign('/');
    }catch{alert('Could not sign out. Please try again.');}
  };
  const navigateToLogin=()=>api.auth.redirectToLogin(window.location.href);
  return <AuthContext.Provider value={{user,isAuthenticated:!!user,isLoadingAuth,isLoadingPublicSettings,authError,appPublicSettings,authChecked,logout,navigateToLogin,checkUserAuth,checkAppState}}>{children}</AuthContext.Provider>;
}
export function useAuth(){
  const context=useContext(AuthContext);
  if(!context)throw new Error("useAuth requires AuthProvider");
  return context;
}
