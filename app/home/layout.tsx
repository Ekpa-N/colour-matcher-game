import LayoutWrapper from "@/components/LayoutWrapper"





export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LayoutWrapper>
      <section>{children}</section>
    </LayoutWrapper>
  )
}