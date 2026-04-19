import "../src/globals.css";

export default function EmployerRootLayout(props: {
  children: any;
}) {
  return (
    <html lang="en">
      <body>{props.children}</body>
    </html>
  );
}
