// src/components/ui/Avatar.tsx
import { stringToColor } from "../../utils/avatar"

type Props = {
  username: string
  src?: string
  size?: number // px
}

const baseUrl = "http://localhost:3001"


export default function Avatar({ username, src, size = 32 }: Props) {
  // if (src) {
  //   return (
  //     <img
  //       src={baseUrl + src}
  //       alt={username}
  //       style={{ width: size, height: size }}
  //       className="rounded-none border-2 border-black bg-white object-cover shadow-[2px_2px_0_0_#000]"
  //     />
  //   )
  // }

  const bgColor = stringToColor(username)
  const letter = username.charAt(0).toUpperCase()

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
      }}
      className="flex items-center justify-center rounded-none border-2 border-black text-sm font-black uppercase text-white shadow-[2px_2px_0_0_#000]"
    >
      {letter}
    </div>
  )
}
