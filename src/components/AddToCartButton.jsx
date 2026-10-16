import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

export default function AddToCartButton({ product, disabled = false }) {
  const { addItem } = useCart();

  return (
    <button
      onClick={() => addItem(product, 1)}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 px-10 py-3.5 bg-copper text-background font-label text-sm tracking-widest uppercase hover:bg-copper/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <ShoppingBag size={16} />
      {disabled ? "Sold Out" : "Add to Hold"}
    </button>
  );
}