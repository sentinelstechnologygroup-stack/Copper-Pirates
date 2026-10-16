export const MAX_QUANTITY = 12;
export function quantity(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= MAX_QUANTITY ? n : null;
}
export function validCart(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  return raw.filter((i) => {
    if (!i || typeof i.id !== "string" || !i.id || seen.has(i.id) || !quantity(i.quantity) || !Number.isFinite(i.price) || i.price < 0) return false;
    seen.add(i.id);
    return true;
  }).slice(0, 24).map((i) => ({
    id: i.id, name: String(i.name || "").slice(0, 150), price: i.price,
    image: typeof i.image === "string" && (/^(https?:\/\/|\/(?!\/))/.test(i.image)) ? i.image : "",
    quantity: i.quantity
  }));
}
export function isAdult(dob, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob || "")) return false;
  const [y,m,d] = dob.split("-").map(Number);
  const birth = new Date(y,m-1,d);
  if (birth.getFullYear() !== y || birth.getMonth() !== m-1 || birth.getDate() !== d) return false;
  const age = now.getFullYear() - y - (now.getMonth()+1 < m || (now.getMonth()+1 === m && now.getDate() < d) ? 1 : 0);
  return age >= 21 && age < 125;
}
