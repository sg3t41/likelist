interface MainTitleProps {
  className?: string;
}

export default function MainTitle({ className = "" }: MainTitleProps) {
  return (
    <div className={`pt-20 ${className}`}>
      {/* フローティングボタン分のスペースのみ */}
    </div>
  );
}