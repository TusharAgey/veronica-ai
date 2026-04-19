import bgImg from "../../assets/bg-image.png";
export function ZapBackdrop() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none flex-1 flex items-center justify-center pointer-events-none opacity-20 position-absolute top-0 left-0 w-full h-full">
      <img src={bgImg} />
    </div>
  );
}
