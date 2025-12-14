import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <main className="relative z-10">
                {children}
            </main>
            <Footer />

            {/* Decorative background gradients */}
            <div className="fixed top-0 left-0 right-0 h-screen pointer-events-none z-0 overflow-hidden">
                <div
                    className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%]"
                    style={{ background: 'radial-gradient(circle, rgba(219, 234, 254, 0.4) 0%, rgba(219, 234, 254, 0) 70%)' }}
                />
                <div
                    className="absolute top-[20%] -right-[10%] w-[40%] h-[40%]"
                    style={{ background: 'radial-gradient(circle, rgba(254, 252, 232, 0.5) 0%, rgba(254, 252, 232, 0) 70%)' }}
                />
            </div>
        </>
    );
}
