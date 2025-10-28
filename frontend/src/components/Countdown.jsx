import React from 'react'

export default function Countdown({ endAt }){
  const [left, setLeft] = React.useState('')
  React.useEffect(()=>{
    const tick = () => {
      const ms = new Date(endAt) - new Date()
      if(ms <= 0) return setLeft('Finalizada')
      const s = Math.floor(ms/1000)
      const d = Math.floor(s/86400)
      const h = Math.floor(s%86400/3600)
      const m = Math.floor(s%3600/60)
      const ss = s%60
      setLeft(`${d}d ${h}h ${m}m ${ss}s`)
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [endAt])
  return <span className="font-mono">{left}</span>
}
