export default function ToSLayout(
  props: {
    children?: React.ReactNode
  }
) {
  return (
      <html lang="en">
      <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Điều khoản sử dụng</title>
      </head>
      <body>
          {props.children}
      </body>
      </html>
  )
}