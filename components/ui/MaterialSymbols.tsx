// componente para icono de material symbols (google)
interface Props {
  name: string;
  className?: string;
  filled?: boolean;
}

export const MaterialSymbol = ({ name, className = "", filled = false }: Props) => {
  return (
    <span 
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
      {name}
    </span>
  );
};