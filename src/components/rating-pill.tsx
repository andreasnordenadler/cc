type RatingPillProps = {
  value: number | string;
  suffix?: string;
  plus?: boolean;
  className?: string;
  ariaLabel?: string;
};

export default function RatingPill({ value, suffix = "Coat of Arms", plus = true, className = "", ariaLabel }: RatingPillProps) {
  void value;
  void plus;
  const textValue = suffix;

  return (
    <span className={`quest-reward rating-pill ${className}`.trim()} aria-label={ariaLabel ?? `${textValue} reward`}>
      {textValue}
    </span>
  );
}
