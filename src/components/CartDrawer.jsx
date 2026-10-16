import {useEffect,useRef} from "react";
import { Link } from "react-router-dom";
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, subtotal, itemCount } =
    useCart();

  const dialog=useRef(null);
  useEffect(()=>{
    if(!isOpen)return;
    const previous=document.activeElement,overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';dialog.current?.querySelector('button')?.focus();
    const keydown=e=>{
      if(e.key==='Escape'){closeCart();return;}
      if(e.key!=='Tab')return;
      const nodes=dialog.current?.querySelectorAll('button:not([disabled]),a[href],input:not([disabled])');
      if(!nodes?.length)return;
      const first=nodes[0],last=nodes[nodes.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    };
    document.addEventListener('keydown',keydown);
    return ()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',keydown);previous?.focus?.();};
  },[isOpen,closeCart]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={closeCart}
      />
      <aside ref={dialog} role="dialog" aria-modal="true" aria-label="Shopping cart" className="absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border flex flex-col animate-fade-in">
        <header className="flex items-center justify-between px-6 h-20 border-b border-border">
          <span className="font-label text-xs text-copper tracking-widest">
            Your Hold ({itemCount})
          </span>
          <button onClick={closeCart} aria-label="Close cart">
            <X size={20} className="text-parchment" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={32} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-body text-lg text-muted-foreground">
                Your hold is empty.
              </p>
              <button
                onClick={closeCart}
                className="mt-6 font-label text-xs text-copper tracking-widest"
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((i) => (
                <li key={i.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-muted border border-border overflow-hidden shrink-0">
                    {i.image && (
                      <img
                        src={i.image}
                        alt={i.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-base text-parchment leading-tight">
                      {i.name}
                    </p>
                    <p className="font-body text-sm text-copper mb-2">
                      ${i.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQty(i.id, i.quantity - 1)}
                          className="px-2 py-1 text-parchment hover:text-copper"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 font-label text-xs text-parchment">
                          {i.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(i.id, i.quantity + 1)}
                          className="px-2 py-1 text-parchment hover:text-copper"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(i.id)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="font-display text-sm text-parchment shrink-0">
                    ${(i.price * i.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="px-6 py-6 border-t border-border">
            <div className="flex items-center justify-between mb-5">
              <span className="font-label text-xs text-muted-foreground tracking-widest">
                Subtotal
              </span>
              <span className="font-display text-2xl text-parchment">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="block w-full py-3.5 bg-copper text-background font-label text-sm tracking-widest uppercase text-center hover:bg-copper/90 transition-colors"
            >
              Checkout
            </Link>
            <p className="font-label text-[10px] text-muted-foreground/70 mt-3 text-center">
              Demo only · No charge or fulfillment
            </p>
          </footer>
        )}
      </aside>
    </div>
  );
}