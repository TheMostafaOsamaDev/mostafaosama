
function Paragraph({ children }: { children: string }) {
  return (
    <p

      className={`sm:w-[300px] lg:w-[550px] text-center sm:text-xl lg:text-2xl
      font-medium text-main-black tracking-normal`}
    >
      {children}
    </p>
  );
}

export default Paragraph;
