interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = ({ className, ...props }: Props) => {
  return (
    <button
      className={`rounded-md bg-zinc-100 p-2 hover:bg-zinc-100/75 dark:bg-zinc-800 hover:dark:bg-zinc-800/75 ${className}`}
      {...props}
    />
  );
};

export default Button;
