// Manual grouping: toLocaleString differs between Node and browsers and breaks hydration
export const czk = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export const mins = (n: number) => `${n} min`;

export const pad2 = (n: number) => String(n).padStart(2, "0");
