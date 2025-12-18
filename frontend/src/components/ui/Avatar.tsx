// src/components/ui/Avatar.tsx
import { stringToColor } from "../../utils/avatar"

type Props = {
  username: string
  src?: string
  size?: number // px
}

const baseUrl = "http://localhost:3001"


export default function Avatar({ username, src, size = 32 }: Props) {
  if (src) {
    return (
      <img
        src={baseUrl + src}
        alt={username}
        style={{ width: size, height: size }}
        className="rounded-full object-cover"
      />
    )
  }

  const bgColor = stringToColor(username)
  const letter = username.charAt(0).toUpperCase()

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
      }}
      className="flex items-center justify-center rounded-full text-sm font-semibold text-white"
    >
      {letter}
    </div>
  )
}
