import "../src/globals.css";

export default function EmployeeRootLayout(props: {
  children: any;
}) {
  return (
    <html lang="en">
      <body>{props.children}</body>
    </html>
  );
}
