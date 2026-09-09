export default function StarRating({
  rating,
  size = 14,
}: {
  rating: number;
  size?: number;
}) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} จาก 5 ดาว`}>
      {stars.map((s) => {
        const filled = s <= Math.round(rating);
        return (
          <svg
            key={s}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? "#f59e0b" : "none"}
            stroke={filled ? "#f59e0b" : "#c7c7cc"}
            strokeWidth="1.5"
          >
            <path d="M12 2.5l2.9 6.06 6.6.8-4.86 4.6 1.28 6.54L12 17.6l-5.92 2.9 1.28-6.54L2.5 9.36l6.6-.8L12 2.5z" />
          </svg>
        );
      })}
    </span>
  );
}
