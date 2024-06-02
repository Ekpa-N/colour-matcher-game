import LayoutWrapper from "@/components/LayoutWrapper"


export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      <LayoutWrapper>
        {children}
      </LayoutWrapper>
    </section>
  )
}