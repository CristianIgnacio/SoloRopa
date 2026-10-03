import { useState, type ComponentProps } from "react"

type Props = ComponentProps<"img">

function ImageWithFallback({ src, onError, ...props }: Props) {
  const [failed, setFailed] = useState(false)
  return (
    <img
      {...props}
      src={failed || !src ? "/img/no-image.svg" : src}
      onError={(event) => {
        setFailed(true)
        onError?.(event)
      }}
    />
  )
}

export default function ProductImage(props: Props) {
  return <ImageWithFallback key={props.src} {...props} />
}
