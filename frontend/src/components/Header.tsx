export default function Header() {
    return (
        <header className="py-6">
        <div className="container flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Spy Game</h1>
            <nav className="flex gap-4">
            <span className="text-sm opacity-80">Multiplayer • Find the spy</span>
            </nav>
        </div>
        </header>
    )
}
