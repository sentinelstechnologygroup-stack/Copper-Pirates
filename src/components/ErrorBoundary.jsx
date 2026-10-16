import { Component } from "react";
export default class ErrorBoundary extends Component {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(error){console.error("Page error:",error);}
 render(){
  if(this.state.failed)return <main className="min-h-screen bg-[#101416] text-[#fff4e1] flex items-center justify-center p-8"><div><h1>We could not load this page.</h1><p>Your saved cart will remain available.</p><button onClick={()=>window.location.reload()} className="border p-3 mt-4">Reload page</button><a className="block underline mt-4" href="/">Return home</a></div></main>;
  return this.props.children;
 }
}
