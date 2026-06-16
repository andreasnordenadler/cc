type RatingPillProps = {
  value: number | string;
  suffix?: string;
  plus?: boolean;
  className?: string;
  ariaLabel?: string;
};

export default function RatingPill({ value, suffix = "pts", plus = true, className = "", ariaLabel }: RatingPillProps) {
  const textValue = `${plus ? "+" : ""}${value}${suffix ? ` ${suffix}` : ""}`;

  return (
    <span className={`quest-points rating-pill ${className}`.trim()} aria-label={ariaLabel ?? `${textValue} rating points`}>
      {textValue}
    </span>
  );
}
