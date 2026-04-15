import bgImg from "../../assets/bg-image.png";
export function ZapBackdrop() {
  return (
    <div className="flex-1 flex items-center justify-center pointer-events-none opacity-20">
      <img src={bgImg} />
    </div>
  );
}
